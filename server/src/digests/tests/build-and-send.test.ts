import '#root/dotenv.js';
import 'reflect-metadata';

import { db } from '#root/db/db.js';
import {
  Feed,
  Item,
  Options,
  User,
  UserFeed,
  UserFeedWithOpts,
  feeds,
  items,
  userFeeds,
  users,
} from '#root/db/schema.js';
import { buildAndSendDigests } from '#root/digests/build-and-send.js';
import { composeDigestMock } from '#root/digests/compose-mail.js';
import { composeEmailSubject } from '#root/digests/compose-subject.js';
import { isFeedReadyMock } from '#root/digests/is-feed-ready.js';
import { transportMock } from '#root/mail/transport.js';
import { closeTestConnection, runTestConnection } from '#root/tests/test-utils/connection.js';
import { generateItemEntity, generateUserWithFeed } from '#root/tests/test-utils/generate-feed.js';
import { DigestSchedule } from '#root/types/enums.js';
import test from 'ava';
import { eq } from 'drizzle-orm';
import { SendMailOptions } from 'nodemailer';
import sinon from 'sinon';

let user: User & { options: Options };
let feed: Feed;
let userFeed: UserFeed;

const $isFeedReady = sinon.fake(() => true);
const $sendMail = sinon.fake(async () => {});
const $composeDigest = sinon.fake(() => ({ text: 'text', html: 'html', errors: [] }));

const hour = 1000 * 60 * 60;
const newItems: Item[] = [];
const oldItems: Item[] = [];

const createItems = async () => {
  const now = Date.now();
  const lastDigestTime = now - hour * 24;
  userFeed.lastDigestSentAt = new Date(lastDigestTime);

  await db
    .update(userFeeds)
    .set({ lastDigestSentAt: userFeed.lastDigestSentAt })
    .where(eq(userFeeds.id, userFeed.id))
    .execute();

  const item = (time: number) => generateItemEntity(feed.id, new Date(time));
  oldItems.push(await item(lastDigestTime - hour * 2));
  oldItems.push(await item(lastDigestTime - hour * 1.5));
  oldItems.push(await item(lastDigestTime - hour));
  newItems.push(await item(lastDigestTime + hour));
  newItems.push(await item(lastDigestTime + hour * 2));
  newItems.push(await item(lastDigestTime + hour * 3));
};

test.before(async () => {
  await runTestConnection();

  ({ user, feed, userFeed } = await generateUserWithFeed());
  await createItems();
  isFeedReadyMock($isFeedReady);
  transportMock({ sendMail: $sendMail });
  composeDigestMock($composeDigest);
});
test.after(async () => {
  await db.delete(users).where(eq(users.id, user.id)).execute();
  await db.delete(feeds).where(eq(feeds.id, feed.id)).execute();
  await closeTestConnection();
});

test.afterEach(() => {
  $isFeedReady.resetHistory();
  $sendMail.resetHistory();
  $composeDigest.resetHistory();
});

test.serial('get new items and send digest mail', async (t) => {
  await buildAndSendDigests(feed.id);

  const uf: UserFeedWithOpts = $isFeedReady.lastCall.firstArg;
  t.is(uf.schedule, DigestSchedule.daily);
  t.is(uf.user.options.dailyDigestHour, 18);

  t.truthy($sendMail.called, 'sendMail should be called');
  const m: SendMailOptions = $sendMail.lastCall.firstArg;
  const expectedMailOpts: SendMailOptions = {
    from: process.env.MAIL_FROM,
    subject: composeEmailSubject(feed.title!, userFeed.schedule, user.options.customSubject),
    to: user.email,
    html: 'html',
    text: 'text',
  };
  t.deepEqual(m, expectedMailOpts);
});

test.serial(
  'should not send too old items even if they were created after the last digest',
  async (t) => {
    await db
      .update(userFeeds)
      .set({
        lastDigestSentAt: new Date(0),
        lastViewedItemDate: new Date(0),
      })
      .where(eq(userFeeds.id, userFeed.id))
      .execute();

    // save very old item
    await generateItemEntity(feed.id, new Date(Date.now() - hour * 48));
    await buildAndSendDigests(feed.id);

    // @ts-ignore
    const itemsPassed: Item[] = $composeDigest.lastCall.args[2];
    t.is(itemsPassed.length, newItems.length);
    const ids = new Set(newItems.map((i) => i.id));
    itemsPassed.forEach((item) => t.true(ids.has(item.id)));
  },
);

test.serial('should filter items', async (t) => {
  newItems[0].title = 'Wrong title ';
  newItems[1].title = 'Correct title ';
  newItems[2].title = 'Another correct title ';
  const updates = newItems.map((i) =>
    db.update(items).set({ title: i.title }).where(eq(items.id, i.id)).execute(),
  );
  await Promise.all(updates);
  await db
    .update(userFeeds)
    .set({ lastDigestSentAt: new Date(0), filter: 'correct title' })
    .where(eq(userFeeds.id, userFeed.id))
    .execute();
  await buildAndSendDigests(feed.id);

  // @ts-ignore
  const itemsPassed: Item[] = $composeDigest.lastCall.args[2];
  t.is(itemsPassed.length, 2);
  const ids = new Set(newItems.map((i) => i.id).slice(1));
  itemsPassed.forEach((item) => t.true(ids.has(item.id)));
});

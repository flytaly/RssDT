import 'reflect-metadata';
import '../../dotenv.js';
import test from 'ava';
import { SendMailOptions } from 'nodemailer';
import sinon from 'sinon';
// eslint-disable-next-line import/extensions
import { Feed, Item, User, UserFeed } from '#entities';

import { transportMock } from '../../mail/transport.js';
import { closeTestConnection, runTestConnection } from '../../tests/test-utils/connection.js';
import { generateItemEntity, generateUserWithFeed } from '../../tests/test-utils/generate-feed.js';
import { DigestSchedule } from '../../types/enums.js';
import { buildAndSendDigests } from '../build-and-send.js';
import { composeDigestMock } from '../compose-mail.js';
import { composeEmailSubject } from '../compose-subject.js';
import { isFeedReadyMock } from '../is-feed-ready.js';

let user: User;
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
  await userFeed.save();
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
  await user.remove();
  await feed.remove();
  await closeTestConnection();
});

test.afterEach(() => {
  $isFeedReady.resetHistory();
  $sendMail.resetHistory();
  $composeDigest.resetHistory();
});

test.serial('get new items and send digest mail', async (t) => {
  await buildAndSendDigests(feed.id);

  const uf: UserFeed = $isFeedReady.lastCall.firstArg;
  t.is(uf.schedule, DigestSchedule.daily);
  t.is(uf.user.options.dailyDigestHour, 18);

  t.truthy($sendMail.called, 'sendMail called');
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
    userFeed.lastDigestSentAt = new Date(0);
    userFeed.lastViewedItemDate = new Date(0);
    await userFeed.save();
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
  await Promise.all(newItems.map((i) => i.save()));
  userFeed.lastDigestSentAt = new Date(0);
  userFeed.filter = 'correct title';
  await userFeed.save();
  await buildAndSendDigests(feed.id);

  // @ts-ignore
  const itemsPassed: Item[] = $composeDigest.lastCall.args[2];
  t.is(itemsPassed.length, 2);
  const ids = new Set(newItems.map((i) => i.id).slice(1));
  itemsPassed.forEach((item) => t.true(ids.has(item.id)));
});

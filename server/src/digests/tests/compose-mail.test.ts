import 'reflect-metadata';
import '../../dotenv.js';
import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import test from 'ava';
// eslint-disable-next-line import/extensions
import { Enclosure, Feed, Item, Options, User, UserFeed } from '#entities';
import { runTestConnection, closeTestConnection } from '../../tests/test-utils/connection.js';
import createWithDefaults from '../../tests/test-utils/create-with-default.js';
import { DigestSchedule, TernaryState } from '../../types/enums.js';
import { composeDigest } from '../compose-mail.js';

const encImgUrl = 'http://somesite.com/path/enc-img.jpg';
const pubdate = new Date();
const locale = 'en-GB';
const timeZone = 'UTC';

function makeTestData() {
  const feed = createWithDefaults(Feed, { title: 'Feed title' });
  const items = new Array(3).fill('').map((_, idx) => {
    const item = createWithDefaults(Item, {
      id: idx,
      pubdate,
      title: `test item ${idx}`,
      link: `http://test_link_${idx}`,
      summary: 'item summary',
    });
    item.enclosures = [
      createWithDefaults(Enclosure, {
        url: encImgUrl,
        type: 'image/jpg',
        length: '1000',
      }),
    ];
    return item;
  });
  feed.items = items;
  const options = createWithDefaults(Options);
  const user = createWithDefaults(User, { locale, timeZone, options });
  const userFeed = createWithDefaults(UserFeed, { user, feed });
  userFeed.schedule = DigestSchedule.daily;
  userFeed.unsubscribeToken = 'unsubscribe-token';
  return { user, userFeed, feed, items };
}

// let user: User;
let userFeed: UserFeed;
let feed: Feed;

test.before(async () => {
  await runTestConnection();
  ({ /* user, */ feed, userFeed } = makeTestData());
});

test.after(async () => {
  await closeTestConnection();
});

test('compose mail: items with body and attachments', async (t) => {
  const { html, text, errors } = composeDigest(userFeed, feed, feed.items!);
  t.truthy((html?.length || 0) > 0);
  t.truthy((text?.length || 0) > 0);
  t.falsy(errors?.length);

  const $ = cheerio.load(html!);
  const title = 'Feed title [Daily digest]';
  t.is($('title').text().trim(), title, 'title');
  t.is($(`b:contains("Table of Content:")`).length, 0, 'no table of content');
  t.is($(`h3>a`).length, 3, 'number of items');
  t.true($(`div:contains(item summary)`).length > 0, 'have summary');

  const enc = $(`a[href="${encImgUrl}"]`);
  t.true(enc.length === 3);
  t.is(enc.first().text(), encImgUrl.split('/').pop());
  const dateStr = DateTime.fromJSDate(pubdate)
    .setZone(timeZone)
    .setLocale(locale)
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  t.true($(`div:contains(${dateStr})`).length > 0);
});
test('compose mail: with Table of Content and without enclosures ', (t) => {
  userFeed.withContentTable = TernaryState.enable;
  userFeed.attachments = TernaryState.disable;
  const { html } = composeDigest(userFeed, feed, feed.items!);
  const $ = cheerio.load(html!);
  t.is($(`b:contains("Table of Content:")`).length, 1, 'have ToC');
  const enc = $(`a[href="${encImgUrl}"]`);
  t.is(enc.length, 0, 'no enclosures');
});

test('compose mail: check timezone and locale', (t) => {
  userFeed.user.timeZone = 'Europe/Moscow';
  userFeed.user.locale = 'ru-RU';
  const { html } = composeDigest(userFeed, feed, feed.items!);
  const $ = cheerio.load(html!);
  const dateStr = DateTime.fromJSDate(pubdate)
    .setZone('Europe/Moscow')
    .setLocale('ru-RU')
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  t.true($(`div:contains(${dateStr})`).length > 0, 'have time in correct locale');
});

test('compose mail: no item body', (t) => {
  userFeed.itemBody = TernaryState.disable;
  const { html } = composeDigest(userFeed, feed, feed.items!);
  const $ = cheerio.load(html!);
  t.is($(`div:contains(item summary)`).length, 0, 'no item body');
});

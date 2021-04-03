import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import 'reflect-metadata';
import { Enclosure, Feed, Item, Options, User, UserFeed } from '#entities';
import '../../tests/test-utils/connection';
import createWithDefaults from '../../tests/test-utils/create-with-default';
import { DigestSchedule, TernaryState } from '../../types/enums';
import { composeDigest } from '../compose-mail';

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

beforeAll(() => {
  ({ /* user, */ feed, userFeed } = makeTestData());
});

describe('Compose digest', () => {
  test('should have items with body and attachments', () => {
    const { html, text, errors } = composeDigest(userFeed, feed, feed.items);
    expect(html?.length! > 0).toBeTruthy();
    expect(text?.length! > 0).toBeTruthy();
    expect(errors).toHaveLength(0);

    const $ = cheerio.load(html!);
    const title = 'Feed title [Daily digest]';
    expect($('title').text().trim()).toBe(title);
    expect($(`b:contains("Table of Content:")`)).toHaveLength(0);
    expect($(`h3>a`)).toHaveLength(3);
    expect($(`div:contains(item summary)`).length > 0).toBeTruthy();

    const enc = $(`a[href="${encImgUrl}"]`);
    expect(enc).toHaveLength(3);
    expect(enc.first().text()).toBe(encImgUrl.split('/').pop());
    const dateStr = DateTime.fromJSDate(pubdate)
      .setZone(timeZone)
      .setLocale(locale)
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
    expect($(`div:contains(${dateStr})`).length > 0).toBeTruthy();
  });

  test('should have table of content and no enclosures', () => {
    userFeed.withContentTable = TernaryState.enable;
    userFeed.attachments = TernaryState.disable;
    const { html } = composeDigest(userFeed, feed, feed.items);
    const $ = cheerio.load(html!);
    expect($(`b:contains("Table of Content:")`)).toHaveLength(1);
    const enc = $(`a[href="${encImgUrl}"]`);
    expect(enc).toHaveLength(0);
  });
  test('should build with correct locale and timezone', () => {
    userFeed.user.timeZone = 'Europe/Moscow';
    userFeed.user.locale = 'ru-RU';
    const { html } = composeDigest(userFeed, feed, feed.items);
    const $ = cheerio.load(html!);
    const dateStr = DateTime.fromJSDate(pubdate)
      .setZone('Europe/Moscow')
      .setLocale('ru-RU')
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
    expect($(`div:contains(${dateStr})`).length > 0).toBeTruthy();
  });

  test("should not have item's body", () => {
    userFeed.itemBody = TernaryState.disable;
    const { html } = composeDigest(userFeed, feed, feed.items);
    const $ = cheerio.load(html!);
    expect($(`div:contains(item summary)`)).toHaveLength(0);
  });
});

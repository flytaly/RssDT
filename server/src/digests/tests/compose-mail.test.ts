import 'reflect-metadata';
import '#root/dotenv.js';

import {
  Enclosure,
  Feed,
  Item,
  ItemWithEnclosures,
  Options,
  User,
  UserFeed,
  UserFeedWithOpts,
} from '#root/db/schema.js';
import { composeDigest } from '#root/digests/compose-mail.js';
import { DigestSchedule, TernaryState, Theme } from '#root/types/enums.js';
import test from 'ava';
import cheerio from 'cheerio';
import { DateTime } from 'luxon';

const encImgUrl = 'http://somesite.com/path/enc-img.jpg';
const pubdate = new Date();
const locale = 'en-GB';
const timeZone = 'UTC';

type PartialItemWithEnclosures = Partial<Item> & { enclosures: Partial<Enclosure>[] };
type PartialUserFeedWithOptions = Partial<UserFeed> & {
  user: Partial<User> & { options: Partial<Options> };
};

function getFeed(f: Partial<Feed> = {}): Partial<Feed> {
  return { title: 'Feed title', ...f };
}

function getUserFeed(uf: Partial<UserFeed> = {}): PartialUserFeedWithOptions {
  return {
    schedule: DigestSchedule.daily,
    unsubscribeToken: 'unsubscribe-token',
    theme: Theme.default,
    itemBody: TernaryState.default,
    attachments: TernaryState.default,
    ...uf,
    user: {
      locale,
      timeZone,
      options: {
        itemBodyDefault: true,
        attachmentsDefault: true,
      },
    },
  };
}

function getItems(): PartialItemWithEnclosures[] {
  return new Array(3).fill('').map((_, idx) => {
    return {
      id: idx,
      pubdate,
      title: `test item ${idx}`,
      link: `http://test_link_${idx}`,
      summary: 'item summary',
      enclosures: [
        {
          url: encImgUrl,
          type: 'image/jpg',
          length: '1000',
        },
      ],
    };
  });
}

function compose(
  userFeed_: PartialUserFeedWithOptions,
  feed_: Partial<Feed>,
  items_: PartialItemWithEnclosures[],
) {
  return composeDigest(
    userFeed_ as unknown as UserFeedWithOpts,
    feed_ as unknown as Feed,
    items_ as unknown as ItemWithEnclosures[],
  );
}

test('compose mail: items with body and attachments', async (t) => {
  const { html, text, errors } = compose(getUserFeed(), getFeed(), getItems());
  t.falsy(errors?.length, 'should be no errors');
  t.truthy((html?.length || 0) > 0, 'html should not be empty');
  t.truthy((text?.length || 0) > 0, 'text should not be empty');

  const $ = cheerio.load(html!);
  const title = 'Feed title [Daily digest]';
  t.is($('title').text().trim(), title, 'title');
  t.is($(`b:contains("Table of Content:")`).length, 0, 'no table of content');
  t.is($(`h3>a`).length, 3, 'number of items');
  t.true($(`div:contains(item summary)`).length > 0, 'have summary');

  const enc = $(`a[href="${encImgUrl}"]`);
  t.true(enc.length === 3, 'have 3 enclosures');
  t.is(enc.first().text(), encImgUrl.split('/').pop() || '', 'enclosure content');
  const dateStr = DateTime.fromJSDate(pubdate)
    .setZone(timeZone)
    .setLocale(locale)
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  t.true($(`div:contains(${dateStr})`).length > 0);
});

test('compose mail: with Table of Content and without enclosures ', (t) => {
  const { html } = compose(
    getUserFeed({ withContentTable: TernaryState.enable, attachments: TernaryState.disable }),
    getFeed(),
    getItems(),
  );
  const $ = cheerio.load(html!);
  t.is($(`b:contains("Table of Content:")`).length, 1, 'have ToC');
  const enc = $(`a[href="${encImgUrl}"]`);
  t.is(enc.length, 0, 'no enclosures');
});

test('compose mail: check timezone and locale', (t) => {
  const uf = getUserFeed();
  uf.user = { ...uf.user, timeZone: 'Europe/Moscow', locale: 'ru-RU' };
  const { html } = compose(uf, getFeed(), getItems());
  const $ = cheerio.load(html!);
  const dateStr = DateTime.fromJSDate(pubdate)
    .setZone('Europe/Moscow')
    .setLocale('ru-RU')
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  t.true($(`div:contains(${dateStr})`).length > 0, 'have time in correct locale');
});

test('compose mail: no item body', (t) => {
  const { html } = compose(getUserFeed({ itemBody: TernaryState.disable }), getFeed(), getItems());
  const $ = cheerio.load(html!);
  t.is($(`div:contains(item summary)`).length, 0, 'no item body');
});

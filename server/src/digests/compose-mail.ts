import { DateTime } from 'luxon';
import mjml2html from 'mjml';
import url from 'url';
import sanitizeHtml from 'sanitize-html';
import { Enclosure } from '../entities/Enclosure';
import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';
import { UserFeed } from '../entities/UserFeed';
import { EnclosureWithTitle, Share } from '../types';
import { TernaryState } from '../types/enums';
import { digestNames } from './digest-names';
import shareProviders from './share';
import themes, { HTMLMailTheme } from './themes';

function getUnsubscribeUrl(unsubscribeToken: string, id: string | number) {
  return `${process.env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}&id=${id}`;
}

function ternaryToBool(value: TernaryState, defaultValue: boolean): boolean {
  if (value === TernaryState.default) return defaultValue;
  return value === TernaryState.enable;
}

const imagesTypes = [
  'image/gif',
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
];

/** Enclosures url could be too long. This function reduces them to filename and saves them as 'title' property. */
const addTitlesToEnclosures = (enclosures?: Enclosure[]) =>
  enclosures
    ? enclosures.reduce((acc, enc) => {
        const noSlashUrl = enc.url?.endsWith('/') ? enc.url.slice(0, enc.url.length - 1) : enc.url;
        const { pathname } = url.parse(noSlashUrl);
        const filename = pathname?.split('/').pop();

        acc.push({ ...enc, title: filename || enc.url });
        return acc;
      }, [] as EnclosureWithTitle[])
    : [];

const getImageFromEnclosures = (enclosures?: Enclosure[]) => {
  const enc = enclosures?.find(({ type }) => imagesTypes.includes(type || ''));
  if (enc) return enc.url;
  return '';
};

export const composeHTML = (userFeed: UserFeed, feed: Feed, items: Item[]) => {
  const { user } = userFeed;
  const { options } = userFeed.user;
  const withToC = ternaryToBool(userFeed.withContentTable, options.withContentTableDefault);
  const withItemBody = ternaryToBool(userFeed.itemBody, options.itemBodyDefault);
  const withAttachments = ternaryToBool(userFeed.attachments, options.attachmentsDefault);
  const theme = themes[userFeed.theme as HTMLMailTheme];
  let resultStr = '<mjml>';
  resultStr += theme.header({ title: feed.title, digestName: digestNames[userFeed.schedule] });
  if (withToC) {
    resultStr += theme.contentTable({ items });
  }
  resultStr += items.reduce((acc, item_) => {
    const { id, title, link } = item_;
    const imageUrl = item_.imageUrl || getImageFromEnclosures(item_.enclosures);
    const date = DateTime.fromJSDate(item_.pubdate)
      .setZone(user.timeZone)
      .setLocale(user.locale)
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
    const enclosures: EnclosureWithTitle[] = withAttachments
      ? addTitlesToEnclosures(item_.enclosures)
      : [];
    const share: Share[] = options.shareEnable
      ? shareProviders
          .filter((s) => !options.shareList?.length || options.shareList.includes(s.id))
          .map((s) => ({ ...s, url: s.getUrl(link, title) }))
      : [];
    const content = withItemBody ? item_.summary || item_.description : '';

    return (
      acc +
      theme.item({
        id,
        title,
        link,
        imageUrl,
        date,
        enclosures,
        content,
        share,
      })
    );
  }, '');

  resultStr += theme.footer({
    unsubscribeUrl: getUnsubscribeUrl(userFeed.unsubscribeToken, userFeed.id),
  });
  resultStr += '</mjml>';
  return mjml2html(resultStr);
};

export const composeText = (userFeed: UserFeed, feed: Feed, items: Item[]) => {
  const { user } = userFeed;
  const { options } = userFeed.user;
  // const withToC = ternaryToBool(userFeed.withContentTable, options.withContentTableDefault);
  // const withAttachments = ternaryToBool(userFeed.attachments, options.attachmentsDefault);
  const withItemBody = ternaryToBool(userFeed.itemBody, options.itemBodyDefault);

  let result = '';

  // header
  result += `${feed.title} [${digestNames[userFeed.schedule]} digest]\n`;

  // items
  result += items.reduce((acc, item_) => {
    const date = DateTime.fromJSDate(item_.pubdate)
      .setZone(user.timeZone)
      .setLocale(user.locale)
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
    const contentHtml = withItemBody ? item_.summary || item_.description : '';
    const contentText = sanitizeHtml(contentHtml, { allowedTags: [] });
    return `${acc}\n\n${item_.title}\n${date}\n${item_.link}\n\n${contentText}\n`;
  }, '');

  // footer
  result += `\n\n========
You are receiving this digest because you subscribed to it on FeedMailu.com
\nUnsubscribe: ${getUnsubscribeUrl(userFeed.unsubscribeToken, userFeed.id)}`;

  return result;
};

export const composeDigest = (userFeed: UserFeed, feed: Feed, items: Item[]) => {
  if (!userFeed?.user?.options) {
    return { errors: [{ message: 'userFeed should have user and user.options objects' }] };
  }
  let html: string = '';
  let errors: Array<{ message: string }> | null = null;
  if (userFeed.theme === 'default') {
    ({ html, errors } = composeHTML(userFeed, feed, items));
  }
  const text = composeText(userFeed, feed, items);
  return { text, html, errors };
};

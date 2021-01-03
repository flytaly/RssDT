import { DateTime } from 'luxon';
import mjml2html from 'mjml';
import url from 'url';
import { Enclosure } from '../entities/Enclosure';
import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';
import { UserFeed } from '../entities/UserFeed';
import { EnclosureWithTitle, Share } from '../types';
import { TernaryState } from '../types/enums';
import { digestNames } from './digest-names';
import shareProviders from './share';
import themes, { HTMLMailTheme } from './themes';

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
const addTitlesToEnclosures = (enclosures: Enclosure[]) =>
    enclosures.reduce((acc, enc) => {
        const noSlashUrl = enc.url?.endsWith('/') ? enc.url.slice(0, enc.url.length - 1) : enc.url;
        const { pathname } = url.parse(noSlashUrl);
        const filename = pathname?.split('/').pop();

        acc.push({ ...enc, title: filename || enc.url });
        return acc;
    }, [] as EnclosureWithTitle[]);

const getImageFromEnclosures = (enclosures: Enclosure[]) => {
    const enc = enclosures.find(({ type }) => imagesTypes.includes(type || ''));
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
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?token=${userFeed.unsubscribeToken}`;
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
                  .map((s) => ({ ...s, url: s.getUrl(item_.link, item_.title) }))
            : [];
        const content = withItemBody ? item_.summary || item_.description : '';
        return acc + theme.item({ id, title, link, imageUrl, date, enclosures, content, share });
    }, '');

    resultStr += theme.footer({ unsubscribeUrl });
    resultStr += '</mjml>';
    return mjml2html(resultStr);
};

export const composeText = (userFeed: UserFeed, feed: Feed, items: Item[]) => {
    const { user } = userFeed;
    const { options } = userFeed.user;
    // const withToC = ternaryToBool(userFeed.withContentTable, options.withContentTableDefault);
    const withItemBody = ternaryToBool(userFeed.itemBody, options.itemBodyDefault);
    const withAttachments = ternaryToBool(userFeed.attachments, options.attachmentsDefault);

    // TODO:
    return '';
};

export const composeDigest = (userFeed: UserFeed, feed: Feed, items: Item[]) => {
    if (!userFeed?.user?.options)
        throw new Error('userFeed should have user and user.options objects');
    let html: string = '';
    let errors: Array<{ message: string }> | null = null;
    if (userFeed.theme === 'default') {
        ({ html, errors } = composeHTML(userFeed, feed, items));
    }
    const text = composeText(userFeed, feed, items);
    return { text, html, errors };
};

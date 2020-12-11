import { Meta, Item } from 'feedparser';
import sanitizeHtml from 'sanitize-html';
import pick from 'lodash.pick';
import { FeedItem, FeedMeta } from '../types';

export function filterMeta(feedMeta?: Meta): FeedMeta {
    if (!feedMeta) return {} as FeedMeta;
    const fields = ['title', 'description', 'link', 'language', 'favicon'];
    const meta: Partial<FeedMeta> = pick(feedMeta, fields);
    meta.imageUrl = feedMeta.image ? feedMeta.image.url : undefined;
    meta.imageTitle = feedMeta.image ? feedMeta.image.title : undefined;

    return meta as FeedMeta;
}

export function filterAndSanitizeHtml(item: Item) {
    const imgSchemes = ['https', 'http'];
    const cleanHtml = (dirty: string) =>
        sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedSchemesByTag: { img: imgSchemes },
            // Only allow imgs with absolute paths
            exclusiveFilter(frame) {
                if (frame.tag === 'img') {
                    const { src } = frame.attribs;
                    return !src || imgSchemes.every((scheme) => !src.startsWith(`${scheme}://`));
                }
                return false;
            },
        });

    const fields = ['title', 'description', 'summary', 'pubdate', 'link', 'guid'];

    const obj: Partial<FeedItem> = pick(item, fields);
    if (item.image && item.image.url) {
        obj.imageUrl = item.image.url;
    }

    // const encFields = ['url', 'type', 'length'];
    // if (item.enclosures && item.enclosures.length) {
    //     obj.enclosures = item.enclosures.map((e) => pick(e, encFields));
    // }

    obj.description = obj.description ? cleanHtml(obj.description) : null;
    obj.summary = obj.summary ? cleanHtml(obj.summary) : null;

    return obj as FeedItem;
}

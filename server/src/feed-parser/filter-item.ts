/* eslint-disable import/no-cycle */
import { Meta, Item } from 'feedparser';
import sanitizeHtml from 'sanitize-html';
import pick from 'lodash.pick';
import { FeedMeta } from '../types';
import { Item as FeedItem } from '../entities/Item';
import { Enclosure } from '../entities/Enclosure';

export function filterMeta(feedMeta?: Meta): FeedMeta {
    if (!feedMeta) return {} as FeedMeta;
    const fields = ['title', 'description', 'link', 'language', 'favicon'];
    const meta: Partial<FeedMeta> = pick(feedMeta, fields);
    meta.imageUrl = feedMeta.image ? feedMeta.image.url : undefined;
    meta.imageTitle = feedMeta.image ? feedMeta.image.title : undefined;

    return meta as FeedMeta;
}

// filter, sanitize Html and return Items
export function createSanitizedItem(item: Partial<Item>, feedId?: number) {
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

    const resultItem = new FeedItem();
    Object.assign(resultItem, pick(item, fields));
    if (item.image && item.image.url) {
        resultItem.imageUrl = item.image.url;
    }

    const encFields = ['url', 'type', 'length'];
    if (item.enclosures && item.enclosures.length) {
        resultItem.enclosures = item.enclosures.map((e) => {
            const enc = new Enclosure();
            Object.assign(enc, pick(e, encFields));
            enc.item = resultItem;
            return enc;
        });
    }
    resultItem.description = resultItem.description ? cleanHtml(resultItem.description) : '';
    resultItem.summary = resultItem.summary ? cleanHtml(resultItem.summary) : '';
    if (feedId) resultItem.feedId = feedId;
    return resultItem;
}

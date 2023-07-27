import { NewEnclosure, NewItemWithEnclosures } from '#root/db/schema.js';
import { Item, Meta } from 'feedparser';
import pick from 'lodash.pick';
import sanitizeHtml from 'sanitize-html';
import { FeedMeta } from '../types/index.js';

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
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'width', 'height', 'style'],
        iframe: ['src', 'width', 'height'],
      },
      allowIframeRelativeUrls: false,
      allowedStyles: { img: { 'max-width': [/.*/] } },
      transformTags: {
        img: (tagName, att) => ({
          tagName,
          attribs: { ...att, style: 'max-width:100%' },
        }),
      },
      allowedSchemesByTag: { img: imgSchemes },
      // allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
      allowProtocolRelative: false,
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

  const resultItem: NewItemWithEnclosures = {};
  Object.assign(resultItem, pick(item, fields));
  if (item.image && item.image.url) {
    resultItem.imageUrl = item.image.url;
  }

  const encFields = ['url', 'type', 'length'];
  if (item.enclosures && item.enclosures.length) {
    resultItem.enclosures = item.enclosures.map((e) => {
      const enc: NewEnclosure = {};
      Object.assign(enc, pick(e, encFields));
      return enc;
    });
  }
  resultItem.description = resultItem.description ? cleanHtml(resultItem.description) : '';
  resultItem.summary = resultItem.summary ? cleanHtml(resultItem.summary) : '';
  if (feedId) resultItem.feedId = feedId;
  return resultItem;
}

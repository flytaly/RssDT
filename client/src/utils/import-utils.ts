import { opmlToJSON } from 'opml-to-json';
import { DigestSchedule, FeedImport } from '../generated/graphql';

type OpmlItem = {
  title?: string;
  xmlurl?: string;
  folder?: string;
  digest_schedule?: string;
  children?: OpmlItem[];
};

export const getFeedsFromOpml = async (opml: string) => {
  const json = await opmlToJSON(opml);
  const feeds: FeedImport[] = [];
  const getFeeds = (items: OpmlItem[]) => {
    items.forEach(({ xmlurl, title, digest_schedule: ds, children }) => {
      if (children && children.length) getFeeds(children);
      if (!xmlurl) return;
      const feed: FeedImport = { url: xmlurl, title };
      if (ds && Object.values(DigestSchedule).includes(ds as DigestSchedule)) {
        feed.schedule = ds as DigestSchedule;
      }
      feeds.push(feed);
    });
  };
  getFeeds(json.children);
  return feeds;
};

export const getFeedsFromText = (t: string) => {
  const feeds: FeedImport[] = [];
  const lines = t.split('\n');
  lines.forEach((line) => {
    const text = line.split(' ')[0];
    let url: string | undefined;
    try {
      url = new URL(text).toString();
    } catch (e) {
      console.error(e);
    }
    if (url) feeds.push({ url });
  });
  return feeds;
};

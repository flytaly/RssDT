import { DB } from '#root/db/db.js';
import { Feed, feeds, NewFeed } from '#root/db/schema.js';
import {
  fetchPageContent,
  getIconsFromBesticonServer,
  getIconsFromPage,
  ImageInfo,
} from '#root/feed-parser/get-icons.js';
import { eq } from 'drizzle-orm';

export async function updateFeedIcons(feed?: Feed | NewFeed, db?: DB | null) {
  const { BESTICON_URL } = process.env;
  if (!feed) return;
  try {
    let favicon: ImageInfo | null = null;
    let icon: ImageInfo | null = null;
    if (!BESTICON_URL) {
      if (!feed.link || feed.link === feed.url) return;
      const content = await fetchPageContent(feed.link);
      if (!content) return;
      ({ favicon, icon } = await getIconsFromPage(feed.link, content));
    }
    if (BESTICON_URL) {
      ({ favicon, icon } = await getIconsFromBesticonServer(feed.link || feed.url));
    }

    if (!favicon && !icon) return;
    if (favicon?.url) feed.siteFavicon = favicon.url;
    if (icon?.url) feed.siteIcon = icon.url;
    if (db && feed.id) await db.update(feeds).set(feed).where(eq(feeds.id, feed.id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(feed?.link, error?.message);
  }
}

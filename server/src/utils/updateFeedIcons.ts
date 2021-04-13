// eslint-disable-next-line import/extensions
import { Feed } from '#entities';
import {
  fetchPageContent,
  getIconsFromBesticonServer,
  getIconsFromPage,
  ImageInfo,
} from '../feed-parser/get-icons.js';

export async function updateFeedIcons(feed?: Feed, save = true) {
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
    if (save) await feed.save();
  } catch (error: any) {
    console.error(feed?.link, error.message);
  }
}

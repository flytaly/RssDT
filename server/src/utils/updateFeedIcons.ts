// eslint-disable-next-line import/extensions
import { Feed } from '#entities';
import { fetchPageContent, getIconsFromPage } from '../feed-parser/get-icons.js';

export async function updateFeedIcons(feed?: Feed, save = true) {
  try {
    if (!feed?.link || feed.link === feed.url) return;
    const content = await fetchPageContent(feed.link);
    if (!content) return;

    const { favicon, icon } = await getIconsFromPage(feed.link, content);
    if (!favicon && !icon) return;
    if (favicon?.href) feed.siteFavicon = favicon.href;
    if (icon?.href) feed.siteIcon = icon.href;

    if (save) await feed.save();
  } catch (error: any) {
    console.error(feed?.link, error.message);
  }
}

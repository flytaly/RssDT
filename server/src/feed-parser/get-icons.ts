import axios from 'axios';
import jsdom from 'jsdom';
import { URL } from 'url';
import { FAVICON_PREF_SIZE, ICON_MIN_SIZE, ICON_PREF_SIZE, UserAgent } from '../constants';
import { fetchImageSize } from '../utils/fetchImageSize';

const axiosInstance = axios.create({ headers: { 'User-Agent': UserAgent }, timeout: 20000 });
axiosInstance.defaults.timeout = 20000;

type ImageInfo = {
  sizes?: [number, number] | null;
  href: string;
};

function getImageInfo(el: Element) {
  const sizes = el.getAttribute('sizes');
  const href = el.getAttribute('href');
  if (!href) return null;

  return { sizes: sizes?.split('x').map((s) => +s) || null, href } as ImageInfo;
}

export async function metaIcons(html: string) {
  const dom = new jsdom.JSDOM(html);

  const icons = Array.from(
    dom.window.document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]'),
  )
    .map(getImageInfo)
    .filter((im) => im) as ImageInfo[];

  const appleIcons = Array.from(
    dom.window.document.querySelectorAll('link[rel="apple-touch-icon"]'),
  )
    .map(getImageInfo)
    .filter((im) => im) as ImageInfo[];

  return {
    icons,
    appleIcons,
  };
}

// Search for icon with width >= preffered width
function choseIcon(icons: ImageInfo[], width: number) {
  if (!icons?.length) return null;
  const iconsWithSizes = icons.filter((ic) => ic.sizes?.[0]);
  if (!iconsWithSizes.length) return icons[0];
  let resultIcon = iconsWithSizes[0];
  for (const icon of iconsWithSizes) {
    const w = icon.sizes![0];
    if (w) {
      if (w >= width) return icon;
      if (w > (resultIcon.sizes?.[0] || 0)) resultIcon = icon;
    }
  }
  return resultIcon;
}

function makeUrlAbsolute(icons: (ImageInfo | null)[], base?: string) {
  icons.forEach((icon) => {
    if (icon?.href) {
      const url = new URL(icon.href, base);
      icon.href = url.href;
    }
  });
}

export async function fetchPageContent(siteUrl: string) {
  const response = await axiosInstance.get(siteUrl);
  return response.data;
}

export async function getIconsFromPage(siteUrl: string, html: string) {
  const { icons, appleIcons } = await metaIcons(html);
  const svg = icons.find((i) => i.href.endsWith('svg')) || null;
  const favicon = choseIcon(icons, FAVICON_PREF_SIZE);
  let icon = choseIcon(icons, ICON_PREF_SIZE);
  const appleIcon = choseIcon(appleIcons, ICON_PREF_SIZE);
  if (appleIcon) {
    icon = !icon?.sizes?.[0] || icon.sizes[0] < ICON_PREF_SIZE ? appleIcon : icon;
  }
  makeUrlAbsolute([svg, favicon, icon], siteUrl);
  if (svg) {
    return { favicon: svg, icon: svg };
  }
  if (icon) {
    if (!icon.sizes) {
      const s = await fetchImageSize(icon!.href);
      icon!.sizes = s && ([s.width || 0, s.height || 0] as [number, number]);
    }
    if (!icon.sizes || icon!.sizes![0] < ICON_MIN_SIZE) icon = null;
  }

  return { favicon, icon };
}

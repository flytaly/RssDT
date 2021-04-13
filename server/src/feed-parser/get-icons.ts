import axios from 'axios';
import jsdom from 'jsdom';
import { URL } from 'url';
import {
  FAVICON_MAX_W,
  FAVICON_MIN_W,
  FAVICON_PREF_W,
  ICON_MAX_W,
  ICON_MIN_W,
  ICON_PREF_W,
  UserAgent,
} from '../constants.js';
import { fetchImageSize } from '../utils/fetchImageSize.js';

const axiosInstance = axios.create({
  headers: { 'User-Agent': UserAgent },
  timeout: 20000,
});
axiosInstance.defaults.timeout = 20000;

export type ImageInfo = {
  height?: number | null;
  width?: number | null;
  format?: string;
  url: string;
  error?: string | null;
};

function getImageInfo(el: Element) {
  const sizes = el.getAttribute('sizes');
  const url = el.getAttribute('href');
  if (!url) return null;

  const [width, height] = sizes?.split('x').map((s) => +s) || [null, null];
  return { width, height, url } as ImageInfo;
}

export function metaIcons(html: string) {
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

// Search for icon with width >= min width
interface ChoseIconOptions {
  wMin: number;
  wPref?: number;
  wMax?: number;
  allowNoWidth?: boolean;
}
const isInBouds = (w: number, min: number, max?: number) => w >= min && (!max || w <= max);

function choseIcon(
  icons: ImageInfo[],
  { wMin, wPref, wMax, allowNoWidth = false }: ChoseIconOptions,
) {
  if (!icons?.length) return null;
  const iconsWithWidth = icons.filter((i) => i.width).sort((a, b) => a.width! - b.width!);
  if (!iconsWithWidth.length) return allowNoWidth ? icons[0] : null;
  if (!wPref) wPref = wMin;

  let resultIcon: ImageInfo | null = null;
  for (let i = 0; i < iconsWithWidth.length; i++) {
    const icon = iconsWithWidth[i];
    if (isInBouds(icon.width as number, wMin, wMax)) {
      if (icon.width! >= wPref) return icon;
      resultIcon = icon;
    }
  }
  return resultIcon;
}

function makeUrlAbsolute(icons: (ImageInfo | null)[], base?: string) {
  icons.forEach((icon) => {
    if (icon?.url) {
      const url = new URL(icon.url, base);
      icon.url = url.href;
    }
  });
}

export async function fetchPageContent(siteUrl: string) {
  const response = await axiosInstance.get(siteUrl);
  return response.data;
}

export async function getIconsFromPage(siteUrl: string, html: string) {
  const { icons, appleIcons } = metaIcons(html);
  const svg = icons.find((i) => i.url.endsWith('svg')) || null;
  if (svg) {
    makeUrlAbsolute([svg], siteUrl);
    return { favicon: svg, icon: svg };
  }

  const favicon = choseIcon(icons, { wMin: FAVICON_PREF_W });
  let icon = choseIcon(icons, { wMin: ICON_PREF_W });
  const appleIcon = choseIcon(appleIcons, { wMin: ICON_PREF_W });
  if (appleIcon) {
    icon = !icon?.width || icon.width < ICON_PREF_W ? appleIcon : icon;
  }
  makeUrlAbsolute([favicon, icon], siteUrl);
  if (icon) {
    if (!icon.width) {
      const s = await fetchImageSize(icon!.url);
      icon.width = s?.width;
      icon.height = s?.height;
    }
    if (!icon.width || icon!.width < ICON_MIN_W) icon = null;
  }

  return { favicon, icon };
}

type BestIconInfo = {
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  error?: string | null;
  sha1sum: string;
};

type BestIconResponse = {
  url: string;
  icons?: BestIconInfo[];
};

export async function getIconsFromBesticonServer(siteLink: string) {
  const baseUrl = process.env.BESTICON_URL;
  if (!baseUrl) throw new Error('No url to besticon server provided');

  const url = new URL('allicons.json', baseUrl);
  url.searchParams.append('url', siteLink);
  // url.searchParams.append('size', `${ICON_MIN_W}..${ICON_PREF_W}..${ICON_MAX_W}`);

  const resp = await axiosInstance.get(url.href);
  const siteIcons = resp.data as BestIconResponse;

  if (!siteIcons.icons) return { favicon: null, icon: null };

  const icon = choseIcon(siteIcons.icons, {
    wMin: ICON_MIN_W,
    wPref: ICON_PREF_W,
    wMax: ICON_MAX_W,
  });
  const favicon = choseIcon(siteIcons.icons, {
    wMin: FAVICON_MIN_W,
    wPref: FAVICON_PREF_W,
    wMax: FAVICON_MAX_W,
  });
  return { favicon, icon };
}

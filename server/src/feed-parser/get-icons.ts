import axios from 'axios';
import jsdom from 'jsdom';
import { URL } from 'url';
import { UserAgent } from '../constants';

const axiosInstance = axios.create({ headers: { 'User-Agetn': UserAgent }, timeout: 20000 });
axiosInstance.defaults.timeout = 20000;

const favSize = 32;
const bigIconSize = 180;

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

export async function getIconsFromMeta(html: string) {
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

function makeUrlAbsolute(icon?: ImageInfo | null, base?: string) {
  if (icon && icon.href) {
    const url = new URL(icon.href, base);
    icon.href = url.href;
  }
  return icon;
}

export async function getIcons(siteUrl: string) {
  const response = await axiosInstance.get(siteUrl);
  const { icons, appleIcons } = await getIconsFromMeta(response.data);
  const svg = icons.find((i) => i.href.endsWith('svg')) || null;
  const favicon = choseIcon(icons, favSize);
  let icon = choseIcon(icons, bigIconSize);
  const appleIcon = choseIcon(appleIcons, bigIconSize);
  if (appleIcon) {
    icon = !icon?.sizes?.[0] || icon.sizes[0] < bigIconSize ? appleIcon : icon;
  }

  return {
    svg: makeUrlAbsolute(svg, siteUrl),
    favicon: makeUrlAbsolute(favicon, siteUrl),
    icon: makeUrlAbsolute(icon, siteUrl),
  };
}

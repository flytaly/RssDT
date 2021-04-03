import { ShareId } from '../types/enums.js';

type DigestShare = {
  id: ShareId;
  getUrl: (url: string, title: string) => string;
  iconUrl: string;
  title: string;
};

const shareProviders: DigestShare[] = [
  {
    id: ShareId.pocket,
    getUrl: (url) => `https://getpocket.com/edit?url=${encodeURIComponent(url)}`,
    iconUrl: `${process.env.FRONTEND_URL}/static/share/pocket_32.png`,
    title: 'Pocket',
  },
  {
    id: ShareId.evernote,
    getUrl: (url, title) =>
      `http://www.evernote.com/clip.action?url=${encodeURIComponent(
        url,
      )}&title=${encodeURIComponent(title)}`,
    iconUrl: `${process.env.FRONTEND_URL}/static/share/evernote_32.png`,
    title: 'Evernote',
  },
  {
    id: ShareId.trello,
    getUrl: (url, title) =>
      `https://trello.com/en/add-card?url=${encodeURIComponent(url)}&name=${encodeURIComponent(
        title,
      )}`,
    iconUrl: `${process.env.FRONTEND_URL}/static/share/trello_32.png`,
    title: 'Trello',
  },
];

export default shareProviders;

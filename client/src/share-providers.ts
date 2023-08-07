import { ShareId } from '@/generated/graphql';

type DigestShare = {
  id: ShareId;
  getUrl: (url: string, title: string) => string;
  iconUrl: string;
  title: string;
};

const shareProviders: DigestShare[] = [
  {
    id: ShareId.Pocket,
    getUrl: (url) => `https://getpocket.com/edit?url=${encodeURIComponent(url)}`,
    iconUrl: `/static/share/pocket_32.png`,
    title: 'Pocket',
  },
  {
    id: ShareId.Evernote,
    getUrl: (url, title) =>
      `http://www.evernote.com/clip.action?url=${encodeURIComponent(
        url,
      )}&title=${encodeURIComponent(title)}`,
    iconUrl: `/static/share/evernote_32.png`,
    title: 'Evernote',
  },
  {
    id: ShareId.Trello,
    getUrl: (url, title) =>
      `https://trello.com/en/add-card?url=${encodeURIComponent(url)}&name=${encodeURIComponent(
        title,
      )}`,
    iconUrl: `/static/share/trello_32.png`,
    title: 'Trello',
  },
];

export default shareProviders;

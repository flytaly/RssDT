import type { IItem } from './IItem.js';

export interface IFeed {
  id: number;
  url: string;
  link?: string;
  title?: string;
  description?: string;
  language?: string;
  favicon?: string;
  siteFavicon?: string;
  siteIcon?: string;
  imageUrl?: string;
  imageTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSuccessfulUpd: Date;
  lastPubdate?: Date;
  activated: boolean;
  lastUpdAttempt: Date;
  items?: IItem[];
  throttled: number;
}

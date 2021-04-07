import { IEnclosure } from './IEnclosure.js';

export interface IItem {
  id: number;
  guid?: string;
  pubdate?: Date;
  link?: string;
  title?: string;
  description?: string;
  summary?: string;
  imageUrl?: string;
  feedId: number;
  enclosures?: IEnclosure[];
  createdAt: Date;
}

import { Request, Response } from 'express';
import type Session from 'express-session';
import type { PubSubEngine } from 'graphql-subscriptions';
import type { Redis } from 'ioredis';
import type { createItemCountLoader } from '../utils/createItemCountLoader.js';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

type MySession = Session.Session & {
  userId: number;
  role: Role;
};

export type ReqWithSession = Request & { session: MySession };
export type MyContext = {
  req: ReqWithSession;
  res: Response;
  redis: Redis;
  itemCountLoader: ReturnType<typeof createItemCountLoader>;
  pubsub: PubSubEngine;
};

export type WSContext = Pick<MyContext, "req">

export type FeedMeta = {
  title: string;
  description: string;
  link: string;
  language: string;
  favicon?: string | undefined;
  imageUrl?: string;
  imageTitle?: string;
};

export type ItemEnclosure = {
  length?: string;
  type?: string;
  url: string;
};

export type FeedItem = {
  title: string;
  description?: string;
  summary?: string;
  pubdate: Date;
  link: string;
  guid: string;
  imageUrl?: string;
  enclosures?: ItemEnclosure[];
};

export type EnclosureWithTitle = { length?: string; url: string; type?: string; title?: string };
export type Share = { url: string; iconUrl: string; title: string };

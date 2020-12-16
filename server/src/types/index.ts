import Session from 'express-session';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

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
};

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
    description?: string | null;
    summary?: string | null;
    pubdate: Date | null;
    link: string;
    guid: string;
    imageUrl?: string;
    enclosures?: ItemEnclosure[] | null;
};

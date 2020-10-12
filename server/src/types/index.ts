import { Request, Response } from 'express';
import { Redis } from 'ioredis';

// eslint-disable-next-line no-undef
export type ReqWithSession = Request & { session: Express.Session };
export type MyContext = {
    req: ReqWithSession;
    res: Response;
    redis: Redis;
};

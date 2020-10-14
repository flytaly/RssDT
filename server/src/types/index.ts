/*  global Express */
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type ReqWithSession = Request & { session: Express.Session & { userId: number } };
export type MyContext = {
    req: ReqWithSession;
    res: Response;
    redis: Redis;
};

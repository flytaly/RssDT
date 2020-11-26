import Session from 'express-session';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { Role } from '../entities/User';

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

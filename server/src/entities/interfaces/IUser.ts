import { Role } from '../../types/index.js';
import { IOptions } from './IOptions.js';
import { IUserFeed } from './IUserFeed.js';

export interface IUser {
  id: number;
  email: string;
  emailVerified: boolean;
  role: Role;
  locale: string;
  timeZone: string;
  userFeeds?: IUserFeed[];
  options: IOptions;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
  deleted?: boolean;
}

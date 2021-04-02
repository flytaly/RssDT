import path from 'path';
import { createConnection } from 'typeorm';
import { IS_DEV, IS_TEST } from './constants';
import { Enclosure } from './entities/Enclosure';
import { Feed } from './entities/Feed';
import { Item } from './entities/Item';
import { Options } from './entities/Options';
import { User } from './entities/User';
import { UserFeed } from './entities/UserFeed';

export const initDbConnection = async (logging?: boolean) => {
  const dbConnection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: logging === undefined ? IS_DEV : logging,
    migrations: IS_TEST ? undefined : [path.join(__dirname, './migrations/*')],
    dropSchema: IS_TEST,
    synchronize: IS_TEST,
    entities: [User, Feed, UserFeed, Item, Enclosure, Options],
  });
  if (!IS_TEST) await dbConnection.runMigrations();

  return dbConnection;
};

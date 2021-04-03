import path from 'path';
import { createConnection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Feed, Item, Options, User, UserFeed, Enclosure } from '#entities';
import { IS_DEV, IS_TEST } from './constants.js';

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

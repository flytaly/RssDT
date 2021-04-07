import { createConnection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Enclosure, Feed, Item, Options, User, UserFeed } from '#entities';
import { IS_DEV, IS_TEST } from './constants.js';

export const initDbConnection = async (logging?: boolean) => {
  const dbConnection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: logging === undefined ? IS_DEV : logging,
    migrations: IS_TEST ? undefined : ['./migrations/*'],
    dropSchema: IS_TEST,
    synchronize: IS_TEST,
    entities: [User, Feed, UserFeed, Item, Enclosure, Options],
  });
  if (!IS_TEST) await dbConnection.runMigrations();

  return dbConnection;
};

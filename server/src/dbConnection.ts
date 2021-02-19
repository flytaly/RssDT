import { createConnection } from 'typeorm';
import path from 'path';
import { IS_DEV, IS_PROD, IS_TEST } from './constants';
import { Item } from './entities/Item';
import { UserFeed } from './entities/UserFeed';
import { User } from './entities/User';
import { Feed } from './entities/Feed';
import { Enclosure } from './entities/Enclosure';
import { Options } from './entities/Options';

export const initDbConnection = async () => {
  const migrationPath = path.join(
    __dirname,
    './migrations/',
    IS_PROD ? 'production/*' : 'development/*',
  );

  const dbConnection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: IS_DEV,
    migrations: IS_TEST ? undefined : [migrationPath],
    dropSchema: IS_TEST,
    synchronize: !IS_PROD,
    entities: [User, Feed, UserFeed, Item, Enclosure, Options],
  });
  if (!IS_DEV) await dbConnection.runMigrations();

  return dbConnection;
};

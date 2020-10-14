import { createConnection } from 'typeorm';
import path from 'path';
import { IS_DEV, IS_PROD, IS_TEST } from './constants';
import { User } from './entities/User';
import { UserFeed } from './entities/UserFeed';
import { Feed } from './entities/Feed';

export const initDbConnection = async () => {
    const migrationPath = path.join(
        __dirname,
        './migrations/',
        IS_PROD ? 'production/*' : 'development/*',
    );

    const dbConnection = await createConnection({
        type: 'postgres',
        database: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        logging: IS_DEV,
        migrations: IS_TEST ? undefined : [migrationPath],
        synchronize: !IS_PROD,
        entities: [User, Feed, UserFeed],
    });

    await dbConnection.runMigrations();

    return dbConnection;
};

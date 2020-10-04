import { createConnection } from 'typeorm';
import path from 'path';
import { IS_PROD } from './constants';
import { TestEntity } from './entities/TestEntity';

export const initDbConnection = async () => {
    const migrationPath = path.join(
        __dirname,
        './migrations/',
        IS_PROD ? 'production/*' : 'development/*',
    );
    console.log('migrationPath:', migrationPath);
    const dbConnection = await createConnection({
        type: 'postgres',
        database: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        logging: true,
        migrations: [migrationPath],
        synchronize: !IS_PROD,
        entities: [TestEntity],
    });

    dbConnection.runMigrations();

    return dbConnection;
};

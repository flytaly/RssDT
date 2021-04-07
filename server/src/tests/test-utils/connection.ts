import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection.js';

// eslint-disable-next-line import/no-mutable-exports
export let db: Connection;

export const runTestConnection = async () => {
  db = await initDbConnection();
};

export const closeTestConnection = async () => {
  db.close();
};

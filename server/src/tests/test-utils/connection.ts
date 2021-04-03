import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection.js';

let db: Connection;

beforeAll(async () => {
  db = await initDbConnection();
});

afterAll(() => {
  return db.close();
});

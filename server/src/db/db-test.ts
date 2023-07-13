import '../dotenv.js';
import { db } from './db.js';
import { users } from './schema.js';

async function selectTest() {
  /* return db.select().from(users); */
  /* return db.query.users.findMany({ with: { options: true } }); */
  /* return db.query.feeds.findMany({ */
  /*   limit: 2, */
  /*   with: { items: { limit: 2, with: { enclosures: true } } }, */
  /* }); */
  /* return db.query.users.findMany({ with: { userFeeds: true } }); */
  return db.query.userFeeds.findMany();
}

selectTest().then((x) => {
  return console.log(JSON.stringify(x, null, 2));
});

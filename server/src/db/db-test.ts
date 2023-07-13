import '../dotenv.js';
import { db } from './db.js';
import { user } from './schema.js';

async function selectTest() {
  /* return db.select().from(user) */
  /* return db.query.user.findMany({ with: { options: true } }); */
  /* return db.query.feed.findMany({ */
  /*   limit: 2, */
  /*   with: { items: { limit: 2, with: { enclosures: true } } }, */
  /* }); */
  /* return db.query.user.findMany({ with: { userFeeds: true } }); */
  return db.query.userFeed.findMany();
}

selectTest().then((x) => {
  return console.log(JSON.stringify(x, null, 2));
});

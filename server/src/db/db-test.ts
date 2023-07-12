import '../dotenv.js';
import { db } from './db.js';
/* import { user } from './schema.js'; */

async function selectTest() {
  /* console.log(await db.select().from(user)); */
  console.log(await db.query.user.findMany({ with: { options: true } }));
}

selectTest();

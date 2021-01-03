import 'reflect-metadata';
import '../../dotenv';
import { Connection } from 'typeorm';
import fs from 'fs';
import { initDbConnection } from '../../dbConnection';
import { Feed } from '../../entities/Feed';
import { UserFeed } from '../../entities/UserFeed';
import { User } from '../../entities/User';
import { Options } from '../../entities/Options';
import { DigestSchedule, TernaryState, Theme } from '../../types/enums';
import { composeDigest } from '../compose-mail';

const outputDir = `${__dirname}/output`;

let db: Connection;
/** Convert feeds to html digest ans save in the directory.
 * Useful for tests */
async function generateDigestsAndSave() {
    db = await initDbConnection();
    const feedsWithItems = await Feed.find({ take: 2, relations: ['items'] });
    try {
        feedsWithItems.forEach((feed, idx) => {
            const uf = UserFeed.create({
                theme: Theme.default,
                schedule: DigestSchedule.daily,
                withContentTable: TernaryState.enable,
                itemBody: TernaryState.enable,
                attachments: TernaryState.enable,
                unsubscribeToken: 'unsubscribe-token',
            });
            const user = User.create({ locale: 'ru-RU', timeZone: 'Europe/Moscow' });
            const options = Options.create({ shareEnable: true });
            user.options = options;
            uf.user = user;
            const { html, text, errors } = composeDigest(uf, feed, feed.items);
            if (errors?.length) {
                console.log('errors:', errors);
                return;
            }

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            const filename = `${idx}-${new URL(feed.url).hostname}`;
            if (html) {
                fs.writeFileSync(`${outputDir}/${filename}.html`, html);
                console.log(`saved: ${filename}.html. Items: ${feed.items.length} `);
            }
            if (text) {
                fs.writeFileSync(`${outputDir}/${filename}.txt`, text);
                console.log(`saved: ${filename}.txt. Items: ${feed.items.length}`);
            }
        });
    } catch (error) {
        console.log('error:', error);
    }
}

async function run() {
    await generateDigestsAndSave();
    await db.close();
}

run();

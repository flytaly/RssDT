import FeedParser from 'feedparser';
import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { defaultLocale, defaultTimeZone } from '../../constants';
import { Feed } from '../../entities/Feed';
import { Options } from '../../entities/Options';
import { UserFeed } from '../../entities/UserFeed';
import { checkFeedInfo, getFeedStream } from '../../feed-parser';
import { logger } from '../../logger';
import { ArgumentError } from './ArgumentError';

type UserInfo = {
    locale?: string;
    timeZone?: string;
};

const upsertUserAndGetId = async (
    conn: Connection | EntityManager | QueryRunner,
    email: string,
    userInfo?: UserInfo | null,
) => {
    const { locale = defaultLocale, timeZone = defaultTimeZone } = userInfo || {};
    // https://stackoverflow.com/a/60443582
    const result = await conn.query(
        `
        WITH new_user AS (
            INSERT INTO "user" ("email", "locale", "timeZone")
            VALUES ($1, $2, $3)
            ON CONFLICT("email") DO NOTHING
            RETURNING id
            ) SELECT COALESCE(
                (SELECT id FROM new_user),
                (SELECT id FROM "user" WHERE email = $1)
                );`,
        [email, locale, timeZone],
    );
    return result[0].coalesce as number;
};

interface CreateUserFeedArgs {
    url: string;
    email?: string | null;
    userId?: number | null;
    userInfo?: UserInfo | null;
}

// Creates userFeed record and upsert feed and user records based on url and email respectively
export const createUserFeed = async ({ url, email, userId, userInfo }: CreateUserFeedArgs) => {
    if (!email && !userId) throw new Error('Not enough arguments to create new feed');

    let errors: ArgumentError[] | null = null;
    let feed = await Feed.findOne({ where: { url } });
    const userFeed = new UserFeed();

    let feedMeta: FeedParser.Meta | undefined;
    let newUrl: string = url;
    if (!feed) {
        try {
            const { feedStream, feedUrl } = await getFeedStream(url, { timeout: 6000 }, true);
            newUrl = feedUrl;
            const { isFeed, meta } = await checkFeedInfo(feedStream);
            if (!isFeed) throw new Error('Not a feed');
            feedMeta = meta;
        } catch (e) {
            if (e.message === 'Not a feed') {
                return { errors: [new ArgumentError('url', e.message)] };
            }
            logger.error(`Couldn't get access to feed: ${url}. ${e.code} ${e.message}`);
            return {
                errors: [new ArgumentError('url', `Couldn't get access to feed`)],
            };
        }
    }

    // actual url of the feed
    if (newUrl !== url) {
        url = newUrl;
        feed = await Feed.findOne({ where: { url } });
    }

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        if (!userId) {
            userId = await upsertUserAndGetId(queryRunner, email!, userInfo);
            const options = Options.create({ userId });
            await queryRunner.manager.save(options);
        }
        if (!feed) {
            feed = new Feed();
            feed.url = url;
            feed.addMeta(feedMeta);
            await queryRunner.manager.save(feed);
        } else {
            const alreadyExist = await queryRunner.manager.findOne(UserFeed, {
                where: { userId, feedId: feed.id },
            });
            if (alreadyExist) {
                throw new Error('feed was already added');
            }
        }
        userFeed.feed = feed;
        userFeed.userId = userId;
        userFeed.feedId = feed.id;
        await queryRunner.manager.save(userFeed);

        await queryRunner.commitTransaction();
    } catch (err) {
        const field = err.message === 'feed was already added' ? 'url' : '';
        errors = [new ArgumentError(field, err.message)];
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
    }

    return { errors, userFeed: errors ? null : userFeed };
};

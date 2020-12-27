import FeedParser from 'feedparser';
import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { defaultLocale, defaultTimeZone } from '../../constants';
import { Feed } from '../../entities/Feed';
import { Options } from '../../entities/Options';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { getFeedStream, parseFeed } from '../../feed-parser';
import { createSanitizedItem } from '../../feed-parser/filter-item';
import { insertNewItems } from '../../feed-watcher/watcher-utils';
import { logger } from '../../logger';
import { ArgumentError } from './ArgumentError';
import { UserFeedOptionsInput } from './inputs';

type UserInfo = {
    locale?: string;
    timeZone?: string;
};

const upsertUser = async (
    conn: Connection | EntityManager | QueryRunner,
    email: string,
    userInfo?: UserInfo | null,
) => {
    const { locale = defaultLocale, timeZone = defaultTimeZone } = userInfo || {};
    const result = await conn.query(
        `
        WITH new_user AS (
                INSERT INTO "user" ("email", "locale", "timeZone")
                       VALUES ($1, $2, $3)
                ON CONFLICT("email") DO NOTHING
                RETURNING *
            )
            SELECT * FROM new_user
        UNION
            SELECT * FROM "user" WHERE email=$1
                `,
        [email, locale, timeZone],
    );
    return result[0] as User;
};

const upsertUserAndReturn = async (
    queryRunner: QueryRunner,
    userId?: number | null,
    email?: string | null,
    userInfo?: UserInfo | null,
) => {
    let user: User;
    if (!userId) {
        user = await upsertUser(queryRunner, email!, userInfo);
        if (!user.id) throw new Error("Couldn't fetch user");
        userId = user.id;
        const options = Options.create({ userId });
        await queryRunner.manager.save(options);
    } else {
        user = await User.findOneOrFail(userId);
    }
    return user;
};

const getFeedVariations = (url: string) => {
    const urlsArray = [{ url }];
    const httpsUrl = url.replace(/^http:\/\//, 'https://');
    if (httpsUrl !== url) {
        urlsArray.push({ url: httpsUrl });
    }
    return urlsArray;
};

const processFeed = async (url: string) => {
    let feed = await Feed.findOne({ where: getFeedVariations(url) });
    if (feed) return { feed };
    let feedMeta: FeedParser.Meta;
    let feedItems: FeedParser.Item[];
    let newUrl: string = url;
    try {
        const { feedStream, feedUrl } = await getFeedStream(url, { timeout: 6000 }, true);
        newUrl = feedUrl;
        ({ feedMeta, feedItems } = await parseFeed(feedStream));
        if (!feedMeta) throw new Error('Not a feed');
    } catch (e) {
        if (e.message === 'Not a feed') {
            return { errors: [new ArgumentError('url', e.message)] };
        }
        logger.error(`Couldn't get access to feed: ${url}. ${e.code} ${e.message}`);
        return { errors: [new ArgumentError('url', `Couldn't get access to feed`)] };
    }
    // actual url of the feed
    if (newUrl !== url) {
        url = newUrl;
        feed = await Feed.findOne({ where: getFeedVariations(url) });
    }
    return { feedMeta, feedItems, url, feed };
};

// creates activated feed with items
const saveActivatedFeed = async (
    url: string,
    feedMeta: FeedParser.Meta,
    feedItems: FeedParser.Item[],
    queryRunner: QueryRunner,
) => {
    const ts = new Date();
    const feed = Feed.create({ url });
    feed.addMeta(feedMeta);
    feed.activated = true;
    feed.lastUpdAttempt = ts;
    feed.lastSuccessfulUpd = ts;
    await queryRunner.manager.save(feed);
    if (feedItems?.length) {
        const itemsToSave = feedItems.map((item) => createSanitizedItem(item, feed.id));
        await insertNewItems(itemsToSave, queryRunner);
    }
    return feed;
};

// creates activated feed with items
const saveNotActivatedFeed = async (url: string, feedMeta: FeedParser.Meta, qR: QueryRunner) => {
    const feed = Feed.create({ url });
    feed.addMeta(feedMeta);
    feed.activated = false;
    await qR.manager.save(feed);
    return feed;
};

interface CreateUserFeedArgs {
    url: string;
    email?: string | null;
    userId?: number | null;
    userInfo?: UserInfo | null;
    feedOpts?: UserFeedOptionsInput;
}

/**
 * Creates userFeed record and upsert feed and user records based on url and email respectively.
 * If userId passed it means that user already exists and logged in.
 * If user is logged in and his email verified then automatically activate feed
 */
export const createUserFeed = async ({
    url: $url,
    email,
    userId,
    userInfo,
    feedOpts,
}: CreateUserFeedArgs) => {
    if (!email && !userId) throw new Error('Not enough arguments to create new user feed');
    const isUserLoggedIn = !!userId;
    // eslint-disable-next-line prefer-const
    let { feed, errors, url, feedMeta, feedItems } = await processFeed($url);
    if (errors) return { errors };

    let userFeed: UserFeed | undefined;
    const qR = getConnection().createQueryRunner();
    await qR.connect();
    await qR.startTransaction();
    try {
        const user = await upsertUserAndReturn(qR, userId, email, userInfo);
        userId = user.id;
        const shouldActivate = isUserLoggedIn && user.emailVerified;
        if (!feed) {
            feed = shouldActivate
                ? await saveActivatedFeed(url!, feedMeta!, feedItems!, qR)
                : await saveNotActivatedFeed(url!, feedMeta!, qR);
        } else {
            userFeed = await qR.manager.findOne(UserFeed, {
                where: { userId, feedId: feed.id },
            });
        }
        if (userFeed && userFeed.activated) throw new Error('feed was already added');

        userFeed =
            userFeed ||
            UserFeed.create({
                activated: shouldActivate,
                feed,
                userId,
                feedId: feed.id,
            });
        userFeed.feed = feed;
        if (feedOpts) qR.manager.getRepository(UserFeed).merge(userFeed, feedOpts);
        await qR.manager.save(userFeed);
        await qR.commitTransaction();
    } catch (err) {
        const field = err.message === 'feed was already added' ? 'url' : '';
        errors = [new ArgumentError(field, err.message)];
        await qR.rollbackTransaction();
    } finally {
        await qR.release();
    }

    return { errors, userFeed: errors ? null : userFeed, feed };
};

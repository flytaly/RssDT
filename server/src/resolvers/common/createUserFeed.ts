import FeedParser from 'feedparser';
import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { defaultLocale, defaultTimeZone } from '../../constants';
import { Feed } from '../../entities/Feed';
import { Options } from '../../entities/Options';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { checkFeedInfo, getFeedStream } from '../../feed-parser';
import { logger } from '../../logger';
import { sendConfirmSubscription } from '../../mail/dispatcher';
import { ArgumentError } from './ArgumentError';
import { UserInfoInput } from './inputs';

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

const processFeed = async (url: string) => {
    let feed = await Feed.findOne({ where: { url } });

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
            return { errors: [new ArgumentError('url', `Couldn't get access to feed`)] };
        }
    }
    // actual url of the feed
    if (newUrl !== url) {
        url = newUrl;
        feed = await Feed.findOne({ where: { url } });
    }
    return { feedMeta, feed, url, errors: null };
};

interface CreateUserFeedArgs {
    url: string;
    email?: string | null;
    userId?: number | null;
    userInfo?: UserInfo | null;
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
}: CreateUserFeedArgs) => {
    if (!email && !userId) throw new Error('Not enough arguments to create new user feed');
    const isUserLoggedIn = !!userId;
    // eslint-disable-next-line prefer-const
    let { feed, errors, url, feedMeta } = await processFeed($url);
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
            feed = Feed.create({ url });
            feed.addMeta(feedMeta);
            feed.activated = shouldActivate;
            await qR.manager.save(feed);
        } else {
            userFeed = await qR.manager.findOne(UserFeed, {
                where: { userId, feedId: feed.id },
            });
        }
        if (userFeed && userFeed.activated) throw new Error('feed was already added');

        userFeed = UserFeed.create({
            activated: shouldActivate,
            feed,
            userId,
            feedId: feed.id,
        });

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

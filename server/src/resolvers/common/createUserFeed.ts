import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { UserFeed } from '../../entities/UserFeed';
import { FieldError } from './FieldError';

const upsertUserAndGetId = async (
    conn: Connection | EntityManager | QueryRunner,
    email: string,
) => {
    // https://stackoverflow.com/a/60443582
    const result = await conn.query(
        `
        WITH new_user AS (
            INSERT INTO "user" ("email")
            VALUES ($1)
            ON CONFLICT("email") DO NOTHING
            RETURNING id
            ) SELECT COALESCE(
                (SELECT id FROM new_user),
                (SELECT id FROM "user" WHERE email = $1)
                );`,
        [email],
    );
    return result[0].coalesce as number;
};

interface CreateUserFeedArgs {
    url: string;
    email?: string | null;
    userId?: number | null;
}

// Creates userFeed record and upsert feed and user records based on url and email respectively
export const createUserFeed = async ({ url, email, userId }: CreateUserFeedArgs) => {
    if (!email && !userId) throw new Error('Not enough arguments to create new feed');

    let errors: FieldError[] | null = null;
    let feed = await Feed.findOne({ where: { url } });
    const userFeed = new UserFeed();

    if (!feed) {
        // TODO: check if url actually works and get feed's info
    }

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        if (!userId) {
            // eslint-disable-next-line no-param-reassign
            userId = await upsertUserAndGetId(queryRunner, email!);
        }
        if (!feed) {
            feed = new Feed();
            feed.url = url;
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
        errors = [new FieldError(field, err.message)];
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
    }

    return { errors, userFeed: errors ? null : userFeed };
};

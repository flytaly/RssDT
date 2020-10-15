import { getConnection } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { User } from '../../entities/User';

export const deleteUserWithEmail = (email: string) =>
    getConnection()
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('email = :email', { email })
        .execute();

export const deleteFeedWithUrl = (url: string) =>
    getConnection()
        .createQueryBuilder()
        .delete()
        .from(Feed)
        .where('url = :url', { url }) //
        .execute();

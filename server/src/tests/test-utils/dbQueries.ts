import normalizeUrl from 'normalize-url';
import { getConnection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Feed, User } from '#entities';

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
    .where('url = :url', { url: normalizeUrl(url) }) //
    .execute();

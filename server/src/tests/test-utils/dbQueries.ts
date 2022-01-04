import { getConnection } from 'typeorm';
import { Feed, User } from '#entities';
import { importNormalizer, normalizeUrl } from '../../utils/normalizer.js';

export const deleteUserWithEmail = (email: string) =>
  getConnection()
    .createQueryBuilder()
    .delete()
    .from(User)
    .where('email = :email', { email })
    .execute();

export const deleteFeedWithUrl = async (url: string) => {
  await importNormalizer();
  return getConnection()
    .createQueryBuilder()
    .delete()
    .from(Feed)
    .where('url = :url', { url: normalizeUrl(url) }) //
    .execute();
};

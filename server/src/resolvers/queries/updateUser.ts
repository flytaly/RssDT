import { getConnection } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../../entities/User';

export async function updateUser(id: number, values: QueryDeepPartialEntity<User>) {
  const result = await getConnection()
    .createQueryBuilder()
    .update(User)
    .set(values)
    .where('id = :id', { id })
    .returning('*')
    .execute();
  return { user: result.raw[0] as User };
}
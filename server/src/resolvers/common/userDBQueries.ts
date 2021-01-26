import { DeepPartial, getConnection } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Options } from '../../entities/Options';
import { User } from '../../entities/User';
import { ArgumentError } from './ArgumentError';

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

export async function createUser(values: DeepPartial<User>) {
  try {
    const user = await getConnection().manager.create(User, values).save();
    return { user };
  } catch (err) {
    if (err.code === '23505') {
      return { error: new ArgumentError('email', 'User already exists') };
    }
    return { error: new ArgumentError('', err.message) };
  }
}

export async function updateUserOptions(userId: number, values: DeepPartial<Options>) {
  const result = await getConnection()
    .createQueryBuilder()
    .update(Options)
    .set(values)
    .where('userId = :id', { id: userId })
    .returning('*')
    .execute();
  return { options: result.raw[0] as Options };
}

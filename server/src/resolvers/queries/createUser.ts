import { DeepPartial, getConnection } from 'typeorm';
import { User } from '../../entities/User';
import { ArgumentError } from '../resolver-types/errors';

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

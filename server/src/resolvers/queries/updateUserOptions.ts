import { DeepPartial, getConnection } from 'typeorm';
import { Options } from '#entities';

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

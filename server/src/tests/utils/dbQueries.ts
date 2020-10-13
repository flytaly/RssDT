import { getConnection } from 'typeorm';
import { User } from '../../entities/User';

export const deleteUserWithEmail = (email: string) =>
    getConnection()
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('email = :email', { email })
        .execute();

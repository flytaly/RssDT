import { User } from '#entities';

class UserWithFeedCount extends User {
  countFeeds: number;
}

interface UserIdId {
  userId?: number;
  email: string;
}

interface UserIdEmail {
  userId: number;
  email?: string;
}

type UserIdArgs = UserIdId | UserIdEmail;

export const getUserAndCountFeeds = async ({ userId, email }: UserIdArgs) => {
  const qb = User.createQueryBuilder('u')
    .select()
    .loadRelationCountAndMap('u.countFeeds', 'u.userFeeds');
  if (userId) {
    qb.where('u.id = :userId', { userId });
  }
  if (email) {
    qb.where('u.email = :email', { email });
  }
  return (qb.getOne() as any) as UserWithFeedCount | undefined;
};

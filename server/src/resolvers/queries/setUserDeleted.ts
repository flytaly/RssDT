import { getManager } from 'typeorm';
import { User, UsersToBeDeleted } from '#entities';

/** Set user.deleted = true and add reference to the user into the deleting queue. */
export const setUserDeleted = async ({ userId }: { userId: number }) => {
  if (!userId) return;
  try {
    await getManager().transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(User)
        .set({ deleted: true })
        .where('id = :id', { id: userId })
        .execute();

      const deleteQueue = new UsersToBeDeleted();
      deleteQueue.userId = userId;
      await manager.save(deleteQueue);
    });
  } catch (error) {
    return error?.message;
  }
};

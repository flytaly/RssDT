import { getManager } from 'typeorm';
import { UserFeed } from '../../entities/UserFeed';

export const setLastViewedItemDate = async ({
  itemId,
  userFeedId,
  userId,
}: {
  itemId: number;
  userFeedId: number;
  userId: number;
}) => {
  const result = await getManager().query(
    `
        UPDATE
            "user_feed" AS uf
        SET
          "updatedAt" = CURRENT_TIMESTAMP,
          "lastViewedItemDate" = Item."createdAt"
        FROM
          (
            SELECT item."createdAt"
            FROM item
            WHERE item.id = $1
          ) AS Item
        WHERE
          uf."id" = $2
          AND uf."userId" = $3
        RETURNING *
    `,
    [itemId, userFeedId, userId],
  );

  if (!result[1]) return null;
  return result[0][0] as UserFeed;
};

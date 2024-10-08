import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ItemFieldsFragment, MyFeedsQuery, UserFeedFieldsFragment } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';

export default function useSetLastViewedItemDate(
  userFeed: UserFeedFieldsFragment,
  items: ItemFieldsFragment[],
) {
  const queryClient = useQueryClient();

  const { isPending, mutate, isError, isSuccess } = useMutation({
    mutationFn: ({ itemId, userFeedId }: { itemId: number; userFeedId: number }) => {
      return getGQLClient().setLastViewedItemDate({
        itemId,
        userFeedId,
      });
    },
    onMutate: async ({ itemId, userFeedId }) => {
      // Optimistically update to the new value
      queryClient.setQueryData<MyFeedsQuery>(['myFeeds'], (old) => {
        if (!old?.myFeeds) return old;
        const updated = old.myFeeds.map((uf) => {
          if (uf.id !== userFeedId) return uf;
          return {
            ...uf,
            lastViewedItemDate: items.find((it) => it.id === itemId)?.createdAt || new Date(),
            newItemsCount: 0,
          };
        });
        return { ...old, myFeeds: updated };
      });
    },
  });

  const newestItem: ItemFieldsFragment | null = items.length ? items[0] : null;

  const { id, lastViewedItemDate } = userFeed;

  useEffect(() => {
    if (!newestItem || isPending || isError || isSuccess) return;
    const prevDate = new Date(lastViewedItemDate);
    const lastDate = new Date(newestItem.createdAt);
    if (prevDate < lastDate) {
      mutate({ itemId: newestItem.id, userFeedId: id });
    }
  }, [id, isError, isPending, isSuccess, lastViewedItemDate, mutate, newestItem]);
}

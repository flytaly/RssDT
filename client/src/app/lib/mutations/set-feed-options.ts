import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UserFeedOptionsInput, MyFeedsQuery } from '@/gql/generated';

import { getGQLClient } from '../gqlClient.client';

export function useSetFeedOptionsMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, opts }: { id: number; opts: UserFeedOptionsInput }) => {
      const { setFeedOptions } = await getGQLClient().setFeedOptions({ id, opts });
      if (setFeedOptions.errors || !setFeedOptions.userFeed) return setFeedOptions;

      queryClient.setQueryData<MyFeedsQuery>(['myFeeds'], (oldData) => {
        if (!oldData?.myFeeds) return oldData;
        const updated = setFeedOptions.userFeed!;
        const myFeeds = oldData.myFeeds.map((uf) => {
          if (uf.id !== updated.id) return uf;
          const feed = uf.feed;
          return { ...uf, ...updated, feed };
        });

        return { ...oldData, myFeeds };
      });
    },
  });

  return mutation;
}

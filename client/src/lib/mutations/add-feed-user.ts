import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UserFeedOptionsInput, type MyFeedsQuery } from '@/gql/generated';

import { getGQLClient } from '../gqlClient.client';

export function useAddFeedToCurrentUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      feedUrl,
      feedOpts,
    }: {
      feedUrl: string;
      feedOpts?: UserFeedOptionsInput;
    }) => {
      const result = await getGQLClient().addFeedToCurrentUser({ input: { feedUrl }, feedOpts });
      if (!result.addFeedToCurrentUser.userFeed) return;
      queryClient.setQueryData<MyFeedsQuery>(['myFeeds'], (oldData) => {
        if (!oldData?.myFeeds) return oldData;
        const newFeed = result.addFeedToCurrentUser.userFeed!;
        return { ...oldData, myFeeds: [...oldData.myFeeds].concat(newFeed) };
      });

      return result;
    },
  });
}

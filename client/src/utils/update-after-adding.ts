import { MutationUpdaterFn } from '@apollo/client';
import { AddFeedToCurrentUserMutation, MyFeedsQuery, MyFeedsDocument } from '../generated/graphql';

export const updateAfterAdding: MutationUpdaterFn<AddFeedToCurrentUserMutation> = (
  cache,
  { data },
) => {
  const uf = data?.addFeedToCurrentUser.userFeed;
  if (uf) {
    const prevQ = cache.readQuery<MyFeedsQuery>({ query: MyFeedsDocument });
    const prevFeeds = prevQ?.myFeeds || [];
    cache.writeQuery<MyFeedsQuery>({
      query: MyFeedsDocument,
      data: { __typename: 'Query', myFeeds: [...prevFeeds, uf] } as MyFeedsQuery,
    });
  }
};

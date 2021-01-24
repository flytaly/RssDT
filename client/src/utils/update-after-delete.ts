import { MutationUpdaterFn } from '@apollo/client';
import { DeleteMyFeedsMutation, MyFeedsDocument, MyFeedsQuery } from '../generated/graphql';

export const updateAfterDelete: MutationUpdaterFn<DeleteMyFeedsMutation> | undefined = (
  cache,
  { data },
) => {
  const ids = new Set(data?.deleteMyFeeds.ids);
  if (ids.size) {
    const prevQ = cache.readQuery<MyFeedsQuery>({ query: MyFeedsDocument });
    const prevFeeds = prevQ?.myFeeds || [];
    cache.writeQuery<MyFeedsQuery>({
      query: MyFeedsDocument,
      data: {
        __typename: 'Query',
        myFeeds: prevFeeds.filter((uf) => !ids.has(String(uf.id))),
      } as MyFeedsQuery,
    });
  }
};

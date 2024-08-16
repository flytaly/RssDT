import { useQueryClient } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { createClient } from 'graphql-ws';
import { useEffect } from 'react';

import { WS_API_URL } from '@/constants';
import { ItemsCountUpdatedSubscription, MyFeedsQuery } from '@/gql/generated';

const query = gql`
  subscription itemsCountUpdated {
    itemsCountUpdated {
      feedId
      count
    }
  }
`;

export default function useItemsCountUpdatedSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = createClient({ url: WS_API_URL });

    (async () => {
      const subscription = client.iterate<ItemsCountUpdatedSubscription>({ query });

      for await (const event of subscription) {
        const updates = event.data?.itemsCountUpdated || [];
        if (!updates.length) continue;

        queryClient.setQueryData<MyFeedsQuery>(['myFeeds'], (oldData) => {
          if (!oldData?.myFeeds) return oldData;
          const myFeeds = oldData.myFeeds.map((uf) => {
            const update = updates.find((u) => u.feedId === uf.feed.id);
            if (!update) return uf;
            return { ...uf, newItemsCount: uf.newItemsCount + update.count };
          });

          return { ...oldData, myFeeds };
        });
      }
    })();

    return () => {
      client.dispose();
    };
  }, [queryClient]);
}

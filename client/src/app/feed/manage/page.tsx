'use client';

import { useQuery } from '@tanstack/react-query';

import Spinner from '@/components/spinner';
import { UserFeed } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';

import FeedTable from './feed-table';

export default function Manage() {
  const { data, isPending } = useQuery({
    queryKey: ['myFeeds'],
    queryFn: async () => {
      return getGQLClient().myFeeds();
    },
  });

  const myFeeds = (data?.myFeeds || []) as UserFeed[];

  return (
    <div className="flex flex-col w-full p-4">
      <h2 className="font-bold text-base">Edit feed digests</h2>
      {isPending ? ( //
        <Spinner className="flex justify-center" />
      ) : (
        <FeedTable feeds={myFeeds} />
      )}
    </div>
  );
}

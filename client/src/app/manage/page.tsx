'use client';

import { useQuery } from '@tanstack/react-query';

import BigCard from '@/app/components/card/big-card';
import FeedNavBar from '@/app/components/card/feed-nav-bar';
import { useRedirectUnauthorized } from '@/app/hooks/useRedirectUnauthorized';
import { getGQLClient } from '@/app/lib/gqlClient.client';
import Spinner from '@/components/spinner';
import { UserFeed } from '@/gql/generated';

import FeedTable from './feed-table';

export default function Manage() {
  const me = useRedirectUnauthorized();

  const { data, isLoading } = useQuery(['myFeeds'], async () => {
    return getGQLClient().myFeeds();
  });

  const myFeeds = (data?.myFeeds || []) as UserFeed[];

  return (
    <BigCard verificationWarning={!me.isLoading && !me.me?.emailVerified}>
      <div className="w-full">
        <FeedNavBar />
        <div className="flex flex-col w-full p-4">
          <h2 className="font-bold text-base">Edit feed digests</h2>
          {isLoading ? ( //
            <Spinner className="flex justify-center" />
          ) : (
            <FeedTable feeds={myFeeds} />
          )}
        </div>
      </div>
    </BigCard>
  );
}

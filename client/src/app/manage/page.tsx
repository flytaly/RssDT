'use client';

import { useQuery } from '@tanstack/react-query';

import FeedNavBar from '@/components/card/feed-nav-bar';
import ToggleableCard from '@/components/card/toggleable-card';
import Spinner from '@/components/spinner';
import { UserFeed } from '@/gql/generated';
import { useRedirectUnauthorized } from '@/hooks/use-redirect-auth';
import { getGQLClient } from '@/lib/gqlClient.client';

import FeedTable from './feed-table';

export default function Manage() {
  const me = useRedirectUnauthorized();

  const { data, isLoading } = useQuery(['myFeeds'], async () => {
    return getGQLClient().myFeeds();
  });

  const myFeeds = (data?.myFeeds || []) as UserFeed[];

  return (
    <ToggleableCard verificationWarning={!me.isLoading && !me.me?.emailVerified}>
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
    </ToggleableCard>
  );
}

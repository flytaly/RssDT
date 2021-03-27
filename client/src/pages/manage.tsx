import { NextPage } from 'next';
import React from 'react';
import FeedTable from '../components/feed-table';
import Layout from '../components/layout/layout';
import FeedNavBar from '../components/main-card/feed-nav-bar';
import MainCard from '../components/main-card/main-card';
import Spinner from '../components/spinner';
import { useMyFeedsQuery, UserFeed } from '../generated/graphql';
import useRedirectUnauthorized from '../hooks/use-auth-route';

const FeedManager: NextPage = () => {
  useRedirectUnauthorized();

  const { data, loading } = useMyFeedsQuery({ ssr: false });
  const myFeeds = (data?.myFeeds || []) as UserFeed[];
  let content: JSX.Element | null = null;
  if (loading) content = <Spinner className="flex justify-center" />;
  else content = <FeedTable feeds={myFeeds} />;
  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="w-full">
          <FeedNavBar />
          <div className="flex flex-col w-full p-4">
            <h2 className="font-bold text-base">Edit feed digests</h2>
            {content}
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedManager;

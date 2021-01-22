import { NextPage } from 'next';
import React from 'react';
import FeedTable from '../../components/feed-table';
import Layout from '../../components/layout/layout';
import MainCard from '../../components/welcome-card/main-card';
import { useMyFeedsQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';

const FeedManager: NextPage = () => {
  const { data } = useMyFeedsQuery({ skip: isServer() });
  const myFeeds = data?.myFeeds || [];

  return (
    <Layout>
      <MainCard big>
        <div className="flex flex-col w-full p-4">
          <h2 className="font-bold text-lg ml-1">Edit feeds</h2>
          {myFeeds.length ? (
            <FeedTable feeds={myFeeds} />
          ) : (
            <div className="text-center">You have no feeds</div>
          )}
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedManager;

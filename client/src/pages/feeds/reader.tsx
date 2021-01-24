import { NextPage } from 'next';
import React from 'react';
import Layout from '../../components/layout/layout';
import FeedNavBar from '../../components/main-card/feed-nav-bar';
import MainCard from '../../components/main-card/main-card';

const FeedReader: NextPage = () => {
  return (
    <Layout>
      <MainCard big>
        <div className="w-full">
          <FeedNavBar />
          <div className="flex flex-col w-full p-4">
            <h2 className="font-bold text-base">Reader</h2>
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedReader;

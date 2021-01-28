import { NextPage } from 'next';
import React from 'react';
import FeedReader from '../../components/feed-reader/feed-reader';
import Layout from '../../components/layout/layout';
import FeedNavBar from '../../components/main-card/feed-nav-bar';
import MainCard from '../../components/main-card/main-card';

const FeedReaderPage: NextPage = () => {
  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="flex flex-col w-full h-full">
          <FeedNavBar />
          <FeedReader />
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedReaderPage;

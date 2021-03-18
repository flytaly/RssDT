import { NextPage } from 'next';
import React from 'react';
import Layout from '../layout/layout';
import FeedNavBar from '../main-card/feed-nav-bar';
import MainCard from '../main-card/main-card';
import FeedReader from './feed-reader';

const FeedReaderPage: NextPage<{ id?: number }> = ({ id }) => {
  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="flex flex-col w-full h-full overflow-hidden">
          <FeedNavBar />
          <FeedReader id={id} />
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedReaderPage;

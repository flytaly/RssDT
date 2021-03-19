import { NextPage } from 'next';
import React, { useEffect } from 'react';
import Layout from '../layout/layout';
import FeedNavBar from '../main-card/feed-nav-bar';
import MainCard from '../main-card/main-card';
import FeedReader from './feed-reader';

const FeedReaderPage: NextPage<{ id?: number }> = ({ id }) => {
  // Add scroll to prevent layout shift while loading feed items
  useEffect(() => {
    const initial = document.body.style.overflowY;
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.overflowY = initial;
    };
  }, []);

  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="flex flex-col w-full">
          <FeedNavBar />
          <FeedReader id={id} />
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedReaderPage;

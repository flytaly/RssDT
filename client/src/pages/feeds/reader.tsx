import { NextPage } from 'next';
import React from 'react';
import Layout from '../../components/layout/layout';
import MainCard from '../../components/main-card/main-card';

const FeedReader: NextPage = () => {
  return (
    <Layout>
      <MainCard big>
        <h2 className="text-center w-full">Reader</h2>
      </MainCard>
    </Layout>
  );
};

export default FeedReader;

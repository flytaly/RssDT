import { NextPage } from 'next';
import React, { useState } from 'react';
import AddFeedModal from '../../components/add-feed-modal';
import FeedTable from '../../components/feed-table';
import CardNavBar from '../../components/main-card/card-nav-bar';
import Layout from '../../components/layout/layout';
import MainCard from '../../components/main-card/main-card';
import { useMyFeedsQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import FeedNavBar from '../../components/main-card/feed-nav-bar';

const FeedManager: NextPage = () => {
  const { data, loading } = useMyFeedsQuery({ skip: isServer() });
  const myFeeds = data?.myFeeds || [];
  const empty = <div className="text-center">{loading ? 'Loading...' : 'You have no feeds'}</div>;
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Layout>
      <MainCard big>
        <div className="w-full">
          <FeedNavBar />
          <div className="flex flex-col w-full p-4">
            <h2 className="font-bold text-base">Edit feed digests</h2>
            {myFeeds.length ? <FeedTable feeds={myFeeds} /> : empty}
            <div className="mt-6">
              <button type="button" className="btn bg-secondary" onClick={() => setModalOpen(true)}>
                Add new feed
              </button>
            </div>
            <AddFeedModal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default FeedManager;

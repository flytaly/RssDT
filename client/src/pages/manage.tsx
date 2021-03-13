import { NextPage } from 'next';
import React, { useState } from 'react';
import FeedTable from '../components/feed-table';
import Layout from '../components/layout/layout';
import FeedNavBar from '../components/main-card/feed-nav-bar';
import MainCard from '../components/main-card/main-card';
import AddFeedModal from '../components/modals/add-feed-modal';
import Spinner from '../components/spinner';
import { useMyFeedsQuery, UserFeed } from '../generated/graphql';
import useRedirectUnauthorized from '../utils/use-auth-route';

const FeedManager: NextPage = () => {
  useRedirectUnauthorized();
  const { data, loading } = useMyFeedsQuery({ ssr: false });
  const myFeeds = (data?.myFeeds || []) as UserFeed[];
  let content: JSX.Element | null = null;
  if (loading)
    content = (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  else if (!myFeeds.length) {
    content = <div className="text-center">You have no feeds</div>;
  } else content = <FeedTable feeds={myFeeds} />;

  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="w-full">
          <FeedNavBar />
          <div className="flex flex-col w-full p-4">
            <h2 className="font-bold text-base">Edit feed digests</h2>
            {content}
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

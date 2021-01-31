import { NextPage } from 'next';
import React from 'react';
import FeedReaderPage from '../../components/feed-reader/feed-reader-page';
import useRedirectUnauthorized from '../../utils/use-auth-route';

const FeedPage: NextPage = () => {
  useRedirectUnauthorized();
  return <FeedReaderPage />;
};

export default FeedPage;

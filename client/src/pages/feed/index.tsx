import { NextPage } from 'next';
import React from 'react';
import FeedReaderPage from '../../components/feed-reader/feed-reader-page';
import type { PathHistory } from '../../types';
import { useUpdateCountsOnPathChange } from '../../hooks/use-update-counts-on-path-change';
import useRedirectUnauthorized from '../../hooks/use-auth-route';

const FeedPage: NextPage<{ pathHistory: PathHistory }> = ({ pathHistory }) => {
  useRedirectUnauthorized();
  useUpdateCountsOnPathChange(pathHistory.prevPath);
  return <FeedReaderPage />;
};

export default FeedPage;

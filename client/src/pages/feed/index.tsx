import { NextPage } from 'next';
import React from 'react';

import FeedReaderPage from '@/components/feed-reader/feed-reader-page';
import useRedirectUnauthorized from '@/hooks/use-auth-route';
import { useUpdateCountsOnPathChange } from '@/hooks/use-update-counts-on-path-change';
import type { PathHistory } from '@/types';

const FeedPage: NextPage<{ pathHistory: PathHistory }> = ({ pathHistory }) => {
  useRedirectUnauthorized();
  useUpdateCountsOnPathChange(pathHistory.prevPath);
  return <FeedReaderPage />;
};

export default FeedPage;

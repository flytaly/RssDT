import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import React from 'react';

import FeedReaderPage from '@/components/feed-reader/feed-reader-page';
import useRedirectUnauthorized from '@/hooks/use-auth-route';
import { useUpdateCountsOnPathChange } from '@/hooks/use-update-counts-on-path-change';
import type { PathHistory } from '@/types';

const FeedPage: NextPage<{ pathHistory: PathHistory }> = ({ pathHistory }) => {
  useRedirectUnauthorized();
  useUpdateCountsOnPathChange(pathHistory.prevPath);
  const router = useRouter();
  const { id } = router.query;
  return <FeedReaderPage id={parseInt(id as string)} />;
};

export default FeedPage;

import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import FeedReaderPage from '../../components/feed-reader/feed-reader-page';
import type { PathHistory } from '../../types';
import { useUpdateCountsOnPathChange } from '../../hooks/use-update-counts-on-path-change';
import useRedirectUnauthorized from '../../hooks/use-auth-route';

const FeedPage: NextPage<{ pathHistory: PathHistory }> = ({ pathHistory }) => {
  useRedirectUnauthorized();
  useUpdateCountsOnPathChange(pathHistory.prevPath);
  const router = useRouter();
  const { id } = router.query;
  return <FeedReaderPage id={id as string} />;
};

export default FeedPage;

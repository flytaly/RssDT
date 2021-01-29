import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import FeedReaderPage from '../../components/feed-reader/feed-reader-page';

const FeedPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return <FeedReaderPage id={id as string} />;
};

export default FeedPage;

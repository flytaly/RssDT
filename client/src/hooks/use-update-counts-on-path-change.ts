import { useEffect } from 'react';

import { useMyFeedsCountLazyQuery } from '@/generated/graphql';

export const useUpdateCountsOnPathChange = (previousPath: string) => {
  const [fetchCounts] = useMyFeedsCountLazyQuery({ ssr: false, fetchPolicy: 'network-only' });
  useEffect(() => {
    if (previousPath && !previousPath.startsWith('/feed')) {
      fetchCounts();
    }
  }, [fetchCounts, previousPath]);
};

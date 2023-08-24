'use client';

import BigCard from '@/app/components/card/big-card';
import FeedNavBar from '@/app/components/card/feed-nav-bar';
import { useRedirectUnauthorized } from '@/app/hooks/useRedirectUnauthorized';

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  const me = useRedirectUnauthorized();

  return (
    <BigCard verificationWarning={!me.isLoading && !me.me?.emailVerified}>
      <div className="flex flex-col w-full h-full">
        <FeedNavBar />
        {children}
      </div>
    </BigCard>
  );
}

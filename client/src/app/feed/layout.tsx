'use client';

import FeedNavBar from '@/app/components/card/feed-nav-bar';
import ToggleableCard from '@/app/components/card/toggleable-card';
import { useRedirectUnauthorized } from '@/app/hooks/useRedirectUnauthorized';

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  const me = useRedirectUnauthorized();

  return (
    <ToggleableCard verificationWarning={!me.isLoading && !me.me?.emailVerified}>
      <div className="flex flex-col w-full h-full">
        <FeedNavBar />
        {children}
      </div>
    </ToggleableCard>
  );
}

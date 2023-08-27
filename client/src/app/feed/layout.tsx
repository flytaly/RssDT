'use client';

import FeedNavBar from '@/components/card/feed-nav-bar';
import ToggleableCard from '@/components/card/toggleable-card';
import { useRedirectUnauthorized } from '@/hooks/use-redirect-auth';

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

import { cookies } from 'next/headers';

import FeedNavBar from '@/components/card/feed-nav-bar';

import { AppState } from './app-state';
import StateProvider from './state-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const appState: AppState = {
    cardWidth: cookieStore.get('width')?.value === 'stretch' ? 'stretch' : '',
  };
  return (
    <StateProvider initialState={appState}>
      <div className="flex flex-col w-full h-full">
        <FeedNavBar />
        {children}
      </div>
    </StateProvider>
  );
}

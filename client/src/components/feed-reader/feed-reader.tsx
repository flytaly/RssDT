import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getGQLClient } from '@/app/lib/gqlClient.client';
import AddFeedModal from '@/components/modals/add-feed-modal';
import ModalSidebar from '@/components/modals/modal-sidebar';
import { UserFeed } from '@/gql/generated';
import useItemsCountUpdatedSubscription from '@/hooks/use-items-count-update';

import FeedContent from './feed-content';
import FeedSidebar from './feed-sidebar';
import Overview from './overview';

const FeedReader = ({ id }: { id?: number }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [addFeedModalOpen, setAddFeedModalOpen] = useState(false);
  const { data, isLoading } = useQuery(['myFeeds'], async () => getGQLClient().myFeeds());
  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const userFeed = id && !isLoading ? myFeeds.find((uf) => uf.id === id) : null;

  useItemsCountUpdatedSubscription();

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200 limit-width">
      <aside className="hidden md:flex flex-col row-span-2 bg-sidebar">
        <div className="flex-shrink-0">
          <FeedSidebar
            feeds={myFeeds}
            loading={isLoading}
            onAddFeedClick={() => setAddFeedModalOpen(true)}
            feedId={id}
          />
          ;
        </div>
        <button
          type="button"
          className="flex flex-col flex-1 py-2 px-2 mx-auto group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="scroll to the top"
        >
          <div className="w-px h-full bg-gray-100 bg-opacity-50 group-hover:bg-opacity-100" />
        </button>
      </aside>
      {userFeed ? (
        <FeedContent userFeed={userFeed as UserFeed} setSidebarModalOpen={setSidebarModalOpen} />
      ) : null}
      {!id && <Overview setSidebarModalOpen={setSidebarModalOpen} feeds={myFeeds as UserFeed[]} />}
      <ModalSidebar
        isOpen={sidebarModalOpen}
        closeModal={() => setSidebarModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        <FeedSidebar
          feeds={myFeeds}
          loading={isLoading}
          onAddFeedClick={() => setAddFeedModalOpen(true)}
          onSidebarClose={() => setSidebarModalOpen(false)}
        />
        ;
      </ModalSidebar>
      <AddFeedModal isOpen={addFeedModalOpen} closeModal={() => setAddFeedModalOpen(false)} />
    </section>
  );
};

export default FeedReader;

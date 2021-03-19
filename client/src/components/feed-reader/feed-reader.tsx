import React, { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import Link from 'next/link';
import BarsIcon from '../../../public/static/bars.svg';
import {
  useItemsCountUpdatedSubscription,
  useMyFeedsQuery,
  UserFeed,
} from '../../generated/graphql';
import AddFeedModal from '../modals/add-feed-modal';
import ModalSidebar from '../modals/modal-sidebar';
import FeedHeader from './feed-header';
import FeedItems from './feed-items';
import FeedSidebar from './feed-sidebar';
import { useLocalState } from './reader-options';
import { createUpdateOnNewItems } from '../../utils/update-unread-count';

const FeedReader: React.FC<{ id?: number }> = ({ id }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const [addFeedModalOpen, setAddFeedModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data, loading } = useMyFeedsQuery({ ssr: false });
  const [readerOpts, setReaderOpts] = useLocalState();
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setShowSearch(false);
    setSearchFilter('');
  }, [id]);

  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const userFeed = id && !loading ? myFeeds.find((uf) => uf.id === id) : null;

  useItemsCountUpdatedSubscription({
    onSubscriptionData: createUpdateOnNewItems(userFeed?.feed.id),
  });

  const toggleSearch = () => setShowSearch((s) => !s);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchFilter(event.target.value);

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200 limit-width">
      <aside className="hidden md:flex flex-col row-span-2 bg-sidebar">
        <div className="flex-shrink-0">
          <FeedSidebar
            feeds={myFeeds}
            loading={loading}
            onAddFeedClick={() => setAddFeedModalOpen(true)}
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
      <div className="px-4 py-1 my-1">
        <div className="flex items-center ">
          <button
            type="button"
            className="md:hidden icon-btn mr-4"
            title="Open list of the feeds"
            onClick={() => setSidebarModalOpen((prev) => !prev)}
          >
            <BarsIcon className="h-4 w-4" />
          </button>
          <FeedHeader
            userFeed={userFeed}
            readerOpts={readerOpts}
            setReaderOpts={setReaderOpts}
            toggleSearch={toggleSearch}
          />
        </div>
        {showSearch ? (
          <div className="mt-2">
            <input
              type="text"
              maxLength={250}
              placeholder="filter feed items by words in their titles"
              className="text-sm shadow-message hover:shadow-message-darker w-full py-1 px-2 rounded-sm
              "
              onChange={debounce(handleSearch, 800)}
            />
            <div>
              <Link href="/help#filter">
                <a className="underline text-xs">search syntax</a>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      {userFeed ? (
        <FeedItems feed={userFeed} readerOpts={readerOpts} filter={searchFilter} />
      ) : (
        <div />
      )}
      <ModalSidebar
        isOpen={sidebarModalOpen}
        closeModal={() => setSidebarModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        <FeedSidebar
          feeds={myFeeds}
          loading={loading}
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

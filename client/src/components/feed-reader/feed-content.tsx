import debounce from 'lodash.debounce';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import BarsIcon from '@/../public/static/bars.svg';
import { UserFeed, useItemsCountUpdatedSubscription } from '@/generated/graphql';
import { createUpdateOnNewItems } from '@/utils/update-unread-count';

import FeedHeader from './feed-header';
import FeedItems from './feed-items';
import { useLocalState } from './reader-options';

const FeedContent = ({
  userFeed,
  setSidebarModalOpen,
}: {
  userFeed: UserFeed;
  setSidebarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [readerOpts, setReaderOpts] = useLocalState();
  const [searchFilter, setSearchFilter] = useState('');
  const [hasNewItems, setHasNewItems] = useState(false);

  useEffect(() => {
    setShowSearch(false);
    setSearchFilter('');
    setHasNewItems(false);
  }, [userFeed.id]);

  /* useItemsCountUpdatedSubscription({ */
  /*   onSubscriptionData: createUpdateOnNewItems(userFeed?.feed.id, () => setHasNewItems(true)), */
  /* }); */

  const toggleSearch = () => setShowSearch((s) => !s);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchFilter(event.target.value);

  return (
    <>
      <div className="px-4 py-1 my-1">
        <div className="flex items-center flex-wrap">
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
              <Link href="/help#filter" className="underline text-xs">
                search syntax
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      <FeedItems
        feed={userFeed}
        readerOpts={readerOpts}
        filter={searchFilter}
        showRefetchBtn={hasNewItems}
        onRefetchEnd={() => setHasNewItems(false)}
      />
    </>
  );
};

export default FeedContent;

import React, { RefObject, useCallback, useState } from 'react';

import EditIcon from '@/assets/edit.svg';
import ExtLinkIcon from '@/assets/external-link.svg';
import ItemBigIcon from '@/assets/item-big.svg';
import ItemMediumIcon from '@/assets/item-middle.svg';
import ItemSmallIcon from '@/assets/item-small.svg';
import MailIcon from '@/assets/mail.svg';
import SearchIcon from '@/assets/search.svg';
import EditFeedModal from '@/components/modals/edit-feed-modal';
import { FeedFieldsFragment, UserFeed, UserFeedFieldsFragment } from '@/gql/generated';
import usePopup from '@/hooks/use-popup';
import { clamp } from '@/utils/clamp';

import { ItemViewId, ItemViews, ReaderOptions } from './reader-options';

const ViewIcon = ({ viewId, className }: { viewId: ItemViewId; className?: string }) => {
  if (viewId === 'collapsed') return <ItemSmallIcon className={className} />;
  if (viewId === 'medium') return <ItemMediumIcon className={className} />;
  return <ItemBigIcon className={className} />;
};

interface FeedHeaderProps {
  userFeed?: ({ feed: FeedFieldsFragment } & UserFeedFieldsFragment) | null;
  readerOpts: ReaderOptions;
  setReaderOpts: React.Dispatch<React.SetStateAction<ReaderOptions>>;
  toggleSearch?: () => void;
}

const FeedHeader = ({ userFeed, readerOpts, setReaderOpts, toggleSearch }: FeedHeaderProps) => {
  const [editFeedModal, setEditFeedModal] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isViewOptsOpen, setIsViewOptsOpen] = useState(false);
  const { anchorRef: fontAnchorRef } = usePopup(
    isOptionsOpen,
    useCallback(() => setIsOptionsOpen(false), [setIsOptionsOpen]),
  );
  const { anchorRef: viewAnchorRef } = usePopup(
    isViewOptsOpen,
    useCallback(() => setIsViewOptsOpen(false), [setIsViewOptsOpen]),
  );

  const changeFontSize = (to: number) =>
    setReaderOpts((prev) => ({
      ...prev,
      fontSize: clamp(prev.fontSize + to, 0, 4) as 0 | 1 | 2 | 3 | 4,
    }));

  const onViewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReaderOpts((p) => ({ ...p, itemView: e.target.value as ItemViewId }));
  };

  const isDigestDisable = userFeed?.schedule === 'disable';
  return (
    <>
      {userFeed && (
        <div className="flex items-baseline flex-1 space-x-1 flex-wrap max-w-full">
          <h3 className="flex items-center font-bold text-lg max-w-full">
            {userFeed.feed.siteFavicon && (
              <img
                className="h-4 w-4 mr-2"
                src={userFeed.feed.siteFavicon}
                alt={`${userFeed.feed.title} favicon`}
              />
            )}
            <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
              {userFeed.title || userFeed.feed.title || userFeed.feed.url}
            </div>
          </h3>
          <div className="flex flex-1 items-baseline space-x-2">
            <a
              href={userFeed?.feed.link || userFeed?.feed.url}
              target="_blank"
              rel="noreferrer"
              title="open the feed's site"
              className="hover:text-link "
            >
              <ExtLinkIcon className="w-4 h-4" />
            </a>
            <button
              type="button"
              title="Edit feed"
              className="icon-btn"
              onClick={() => setEditFeedModal(true)}
            >
              <EditIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              title={
                isDigestDisable
                  ? 'Email digest of this feed is disabled'
                  : 'You are receiving email digests of this feed'
              }
              className={`icon-btn ${isDigestDisable ? 'text-gray-400' : 'text-gray-800'}`}
              onClick={() => setEditFeedModal(true)}
            >
              <MailIcon className="h-4 w-4" />
            </button>
            <div className="flex-1" />
            {toggleSearch ? (
              <button
                type="button"
                className="h-4 icon-btn hover:text-primary"
                title="Filter items"
                onClick={() => toggleSearch()}
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            ) : null}
            <div ref={viewAnchorRef as RefObject<HTMLDivElement>} className="relative mr-2">
              <button
                type="button"
                className="h-4 icon-btn hover:text-primary"
                title="Feed items display style"
                onClick={() => setIsViewOptsOpen((s) => !s)}
              >
                <ViewIcon viewId={readerOpts.itemView} className="w-4 h-4" />
              </button>
              {!isViewOptsOpen ? null : (
                <div className="absolute bg-white top-full -right-2 shadow-popup text-xs z-10 min-w-min rounded-sm border border-gray-300 arrow-tr">
                  {Object.keys(ItemViews).map((id) => (
                    <label
                      key={id}
                      className={`flex items-center hover:text-primary hover:bg-gray-100 focus-within:text-primary focus-within:bg-gray-100 whitespace-nowrap px-2 ${
                        id === readerOpts.itemView ? 'text-secondary' : ''
                      }`}
                    >
                      <ViewIcon viewId={id as ItemViewId} className="w-4 h-4 mr-2 my-1" />
                      <span>{ItemViews[id as ItemViewId]}</span>
                      <input
                        name="items-view"
                        id={id}
                        value={id}
                        type="radio"
                        className="w-0 h-0 opacity-0"
                        onChange={onViewChange}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div ref={fontAnchorRef as RefObject<HTMLDivElement>} className="relative">
              <button
                type="button"
                className="icon-btn hover:text-primary"
                title="Feed reader options"
                onClick={() => setIsOptionsOpen((s) => !s)}
              >
                <span className="text-sm leading-5">A</span>
                <span className="text-lg leading-5">A</span>
              </button>
              {!isOptionsOpen ? null : (
                <div className="absolute bg-white top-full -right-2 shadow-popup text-xs z-10 min-w-min p-2 rounded-sm border border-gray-300 arrow-tr">
                  <b>Font size</b>
                  <div className="flex w-24 mt-1 mb-2">
                    <button
                      type="button"
                      className="px-1 border border-opacity-40 border-black inline-block
                    hover:bg-gray-100 hover:border-opacity-100 w-1/2 text-xs"
                      title="decrease"
                      onClick={() => changeFontSize(-1)}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      className="px-1 border border-opacity-40 border-black inline-block
                    hover:bg-gray-100 hover:border-opacity-100 w-1/2 text-base"
                      title="increase"
                      onClick={() => changeFontSize(+1)}
                    >
                      A
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <EditFeedModal
        feed={userFeed as UserFeed}
        isOpen={editFeedModal}
        closeModal={() => setEditFeedModal(false)}
      />
    </>
  );
};

export default FeedHeader;

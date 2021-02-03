import React, { RefObject, useCallback, useState } from 'react';
import MailIcon from '../../../public/static/envelope.svg';
import ItemBigIcon from '../../../public/static/item-big.svg';
import ItemMediumIcon from '../../../public/static/item-middle.svg';
import ItemSmallIcon from '../../../public/static/item-small.svg';
import ExtLinkIcon from '../../../public/static/external-link.svg';
import { FeedFieldsFragment, UserFeed, UserFeedFieldsFragment } from '../../generated/graphql';
import { clamp } from '../../utils/clamp';
import usePopup from '../../utils/use-popup';
import EditFeedModal from '../modals/edit-feed-modal';
import { ItemViewId, ItemViews, ReaderOptions } from './reader-options';

const ViewIcon: React.FC<{ viewId: ItemViewId; className?: string }> = ({ viewId, className }) => {
  if (viewId === 'collapsed') return <ItemSmallIcon className={className} />;
  if (viewId === 'medium') return <ItemMediumIcon className={className} />;
  return <ItemBigIcon className={className} />;
};

interface FeedHeaderProps {
  userFeed?: ({ feed: FeedFieldsFragment } & UserFeedFieldsFragment) | null;
  readerOpts: ReaderOptions;
  setReaderOpts: React.Dispatch<React.SetStateAction<ReaderOptions>>;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ userFeed, readerOpts, setReaderOpts }) => {
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
        <span className="flex items-center w-full">
          <h3 className="font-bold text-lg max-w-sm">{userFeed.feed.title || userFeed.feed.url}</h3>
          <a
            href={userFeed?.feed.link || userFeed?.feed.url}
            target="_blank"
            rel="noreferrer"
            title="open the feed's site"
            className="hover:text-link"
          >
            <ExtLinkIcon className="icon-btn w-4 h-4 mx-1" />
          </a>
          <button
            type="button"
            title={
              isDigestDisable
                ? 'Email digest of this feed is disabled'
                : 'You are receiving email digests of this feed'
            }
            className="icon-btn h-4 w-4 ml-1 mr-2"
            style={{ lineHeight: '1rem' }}
            onClick={() => setEditFeedModal(true)}
          >
            <MailIcon
              className={`w-auto h-4 ${
                isDigestDisable ? 'text-gray-400' : 'text-gray-800'
              } hover:text-primary`}
            />
          </button>
          <div ref={viewAnchorRef as RefObject<HTMLDivElement>} className="relative ml-auto mr-2">
            <button
              type="button"
              className="h-4 icon-btn hover:text-primary"
              title="Feed items display style"
              onClick={() => setIsViewOptsOpen((s) => !s)}
            >
              <ViewIcon viewId={readerOpts.itemView} className="w-auto h-4" />
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
                    <ViewIcon viewId={id as ItemViewId} className="w-auto h-4 mr-2 my-1" />
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
              className="flex items-center icon-btn hover:text-primary"
              title="Feed reader options"
              onClick={() => setIsOptionsOpen((s) => !s)}
            >
              <div>
                <span className="text-sm leading-5">A</span>
                <span className="text-lg leading-5">A</span>
              </div>
            </button>
            {!isOptionsOpen ? null : (
              <div className="absolute bg-white top-full -right-2 shadow-popup text-xs z-10 min-w-min   p-2 rounded-sm border border-gray-300 arrow-tr">
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
        </span>
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

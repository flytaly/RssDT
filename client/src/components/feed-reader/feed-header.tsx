import React, { RefObject, useCallback, useState } from 'react';
import MailIcon from '../../../public/static/envelope.svg';
import GearIcon from '../../../public/static/settings.svg';
import { FeedFieldsFragment, UserFeed, UserFeedFieldsFragment } from '../../generated/graphql';
import usePopup from '../../utils/use-popup';
import EditFeedModal from '../modals/edit-feed-modal';

interface FeedHeaderProps {
  userFeed?: ({ feed: FeedFieldsFragment } & UserFeedFieldsFragment) | null;
  changeFontSize: (amount: number) => void;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ userFeed, changeFontSize }) => {
  const [editFeedModal, setEditFeedModal] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { anchorRef } = usePopup(
    isOptionsOpen,
    useCallback(() => setIsOptionsOpen(false), [setIsOptionsOpen]),
  );
  const isDigestDisable = userFeed?.schedule === 'disable';
  return (
    <>
      {userFeed && (
        <span className="flex items-center w-full">
          <h3 className="font-bold text-lg max-w-sm">{userFeed.feed.title || userFeed.feed.url}</h3>
          <button
            type="button"
            title={
              isDigestDisable
                ? 'Email digest of this feed is disabled'
                : 'You are receiving email digests of this feed'
            }
            className="icon-btn h-4 w-4 mx-2"
            style={{ lineHeight: '1rem' }}
            onClick={() => setEditFeedModal(true)}
          >
            <MailIcon
              className={`w-auto h-4 ${isDigestDisable ? 'text-gray-400' : 'text-gray-800'}`}
            />
          </button>
          <div ref={anchorRef as RefObject<HTMLDivElement>} className="h-4 ml-auto relative">
            <button
              type="button"
              className="h-4 w-4 icon-btn"
              title="Feed reader options"
              onClick={() => setIsOptionsOpen((s) => !s)}
            >
              <GearIcon className="w-auto h-4" />
            </button>
            {!isOptionsOpen ? null : (
              <div className="absolute bg-white top-full right-0 shadow-popup text-xs z-10 min-w-min   p-2 rounded-sm border border-opacity-40 border-black">
                <b>Font size</b>
                <div className="flex w-24 mt-1 mb-2 ">
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

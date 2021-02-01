import React, { useState } from 'react';
import MailIcon from '../../../public/static/envelope.svg';
import { FeedFieldsFragment, UserFeed, UserFeedFieldsFragment } from '../../generated/graphql';
import EditFeedModal from '../modals/edit-feed-modal';

interface FeedHeaderProps {
  userFeed?: ({ feed: FeedFieldsFragment } & UserFeedFieldsFragment) | null;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ userFeed }) => {
  const [editFeedModal, setEditFeedModal] = useState(false);
  const isDigestDisable = userFeed?.schedule === 'disable';
  return (
    <>
      {userFeed && (
        <span className="flex items-center space-x-2">
          <h3 className="font-bold text-lg max-w-sm">{userFeed.feed.title || userFeed.feed.url}</h3>
          <button
            type="button"
            title={
              isDigestDisable
                ? 'Email digest of this feed is disabled'
                : 'You are receiving email digests of this feed'
            }
            className="h-4 w-4 icon-btn overflow-visible"
            style={{ lineHeight: '1rem' }}
            onClick={() => setEditFeedModal(true)}
          >
            <MailIcon
              className={`width-auto height-full ${
                isDigestDisable ? 'text-gray-400' : 'text-gray-800'
              }`}
            />
          </button>
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

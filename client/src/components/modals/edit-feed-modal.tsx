import React from 'react';
import ArrowLeftIcon from '../../../public/static/arrow-left.svg';
import { UserFeed } from '../../generated/graphql';
import FeedOptionsForm from '../forms/feed-options-form';
import ModalSidebar from './modal-sidebar';

interface EditFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
  feed: UserFeed | null;
}

const InfoRow: React.FC<{ title: string }> = ({ title, children }) => (
  <div className="flex items-center mb-3">
    <b className="font-medium">{title}</b>
    <div className="flex-1 ml-3 p-1 border-b-2 border-gray-500 overflow-x-scroll">{children}</div>
  </div>
);

const EditFeedModal: React.FC<EditFeedModalProps> = ({ isOpen, closeModal, feed }) => {
  return (
    <ModalSidebar isOpen={isOpen} closeModal={closeModal} contentLabel="Edit feed">
      {!feed ? null : (
        <div className="flex flex-col p-4 bg-gray-200 w-full h-full text-sm overflow-scroll">
          <div className="flex items-start justify-between h-9">
            <button type="button" className="icon-btn">
              <ArrowLeftIcon className="w-4" />
            </button>
            {feed.feed.imageUrl ? (
              <img src={feed.feed.imageUrl} alt="feed icon" className="w-auto h-full " />
            ) : null}
          </div>
          <h3 className="font-bold mb-3 text-base">{feed.feed.title}</h3>
          <h4 className="font-semibold mb-3 text-base">Feed settings</h4>
          <FeedOptionsForm feed={feed} />

          <h4 className="font-semibold my-3 text-base">Feed Info</h4>
          <InfoRow title="Site Link">
            <a className="underline" href={feed.feed.link || feed.feed.url}>
              {feed.feed.link || feed.feed.url}
            </a>
          </InfoRow>
          <InfoRow title="Feed URL">
            <a className="underline" href={feed.feed.url}>
              {feed.feed.url}
            </a>
          </InfoRow>
          <InfoRow title="Date Added">{new Date(feed.createdAt).toLocaleString()}</InfoRow>
          <InfoRow title="Date of the last digest">
            {new Date(feed.lastDigestSentAt).toLocaleString()}
          </InfoRow>
          <div className="py-4" />
        </div>
      )}
    </ModalSidebar>
  );
};

export default EditFeedModal;

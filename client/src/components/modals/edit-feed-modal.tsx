import React from 'react';

import ArrowLeftIcon from '@/assets/arrow-left.svg';
import InfoIcon from '@/assets/info.svg';
import FeedOptionsForm from '@/components/forms/feed-options-form';
import { UserFeed } from '@/gql/generated';

import ModalSidebar from './modal-sidebar';

interface EditFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
  feed: UserFeed | null;
}

function InfoRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center mb-3">
      <b className="font-medium">{title}</b>
      <div className="flex-1 ml-3 p-1 border-b-2 border-gray-500 overflow-auto">{children}</div>
    </div>
  );
}

export default function EditFeedModal({ isOpen, closeModal, feed }: EditFeedModalProps) {
  const imageUrl = feed?.feed.imageUrl || feed?.feed.siteIcon;
  return (
    <ModalSidebar
      isOpen={isOpen}
      closeModal={closeModal}
      contentLabel="Feed digest options and information"
    >
      {feed && (
        <div className="flex flex-col p-4 bg-gray-200 w-full h-full text-sm overflow-scroll">
          <div className="flex items-start justify-between h-9">
            <button type="button" className="icon-btn" onClick={closeModal}>
              <ArrowLeftIcon className="w-4" />
            </button>
            {imageUrl ? <img src={imageUrl} alt="feed icon" className="w-auto h-full " /> : null}
          </div>
          <h3 className="font-bold mb-3 text-base">{feed.feed.title}</h3>
          <FeedOptionsForm feed={feed} />
          <h4 className="flex items-center font-semibold pl-2 mt-4 mb-3 text-base bg-primary-2">
            <InfoIcon className="h-4 mr-1" />
            Feed Info
          </h4>
          <InfoRow title="Original Title">{feed.feed.title}</InfoRow>
          <InfoRow title="Site Link">
            <a className="underline text-link" href={feed.feed.link || feed.feed.url}>
              {feed.feed.link || feed.feed.url}
            </a>
          </InfoRow>
          <InfoRow title="Feed URL">
            <a className="underline text-link" href={feed.feed.url}>
              {feed.feed.url}
            </a>
          </InfoRow>
          <InfoRow title="Date Added">{new Date(feed.createdAt).toLocaleString()}</InfoRow>
          <InfoRow title="Newest post date">
            {feed.feed.lastPubdate ? new Date(feed.feed.lastPubdate).toLocaleString() : '-'}
          </InfoRow>
          <InfoRow title="Date of the last digest">
            {feed.lastDigestSentAt ? new Date(feed.lastDigestSentAt).toLocaleString() : '-'}
          </InfoRow>
          <div className="py-4" />
        </div>
      )}
    </ModalSidebar>
  );
}

import React, { useState } from 'react';
import BarsIcon from '../../../public/static/bars.svg';
import { useMyFeedsQuery, UserFeed } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import ModalSidebar from '../modals/modal-sidebar';
import FeedItems from './feed-items';
import FeedSidebar from './feed-sidebar';

const FeedReader: React.FC<{ id?: string }> = ({ id }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, loading } = useMyFeedsQuery({ skip: isServer() });
  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const feedList = <FeedSidebar feeds={myFeeds} loading={loading} />;

  let titleElem = <div />;
  let itemsElem = <div />;
  if (id && !loading) {
    const userFeed = myFeeds.find((uf) => uf.id === parseInt(id));
    if (userFeed) {
      itemsElem = <FeedItems feed={userFeed} />;
      titleElem = <h3 className="font-bold text-lg">{userFeed.feed.title || userFeed.feed.url}</h3>;
    }
  }

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200">
      <aside className="hidden md:block row-span-2">{feedList}</aside>
      <div className="px-4 py-1 flex items-center">
        <button
          type="button"
          className="md:hidden icon-btn w-4 h-4 mr-4"
          title="Open list of the feeds"
          onClick={() => setModalOpen((prev) => !prev)}
        >
          <BarsIcon />
        </button>
        {titleElem}
      </div>
      {itemsElem}
      <ModalSidebar
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        {feedList}
      </ModalSidebar>
    </section>
  );
};

export default FeedReader;

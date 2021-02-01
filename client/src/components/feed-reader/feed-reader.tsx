import React, { useState } from 'react';
import BarsIcon from '../../../public/static/bars.svg';
import { useMyFeedsQuery, UserFeed } from '../../generated/graphql';
import { clamp } from '../../utils/clamp';
import { isServer } from '../../utils/is-server';
import ModalSidebar from '../modals/modal-sidebar';
import FeedHeader from './feed-header';
import FeedItems from './feed-items';
import FeedSidebar from './feed-sidebar';
import { useLocalState } from './reader-options';

const FeedReader: React.FC<{ id?: string }> = ({ id }) => {
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false);
  const { data, loading } = useMyFeedsQuery({ skip: isServer() });
  const [readerOpts, setReaderOpts] = useLocalState();

  const changeFontSize = (to: number) =>
    setReaderOpts((prev) => ({
      ...prev,
      fontSize: clamp(prev.fontSize + to, 0, 4) as 0 | 1 | 2 | 3 | 4,
    }));

  const myFeeds = data?.myFeeds || ([] as UserFeed[]);
  const feedList = <FeedSidebar feeds={myFeeds} loading={loading} />;

  const userFeed = id && !loading ? myFeeds.find((uf) => uf.id === parseInt(id)) : null;

  return (
    <section className="block md:reader-layout flex-grow bg-gray-200">
      <aside className="hidden md:block row-span-2">{feedList}</aside>
      <div className="flex items-center px-4 py-1 my-1 hover:bg-primary-1">
        <button
          type="button"
          className="md:hidden icon-btn w-4 h-4 mr-4"
          title="Open list of the feeds"
          onClick={() => setSidebarModalOpen((prev) => !prev)}
        >
          <BarsIcon />
        </button>
        <FeedHeader userFeed={userFeed} changeFontSize={changeFontSize} />
      </div>
      {userFeed ? <FeedItems feed={userFeed} readerOpts={readerOpts} /> : <div />}
      <ModalSidebar
        isOpen={sidebarModalOpen}
        closeModal={() => setSidebarModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        {feedList}
      </ModalSidebar>
    </section>
  );
};

export default FeedReader;

import React, { useState } from 'react';
import FeedSidebar from './feed-sidebar';
import BarsIcon from '../../../public/static/bars.svg';
import ModalSidebar from '../modals/modal-sidebar';

const FeedReader: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <section className="block sm:reader-layout flex-grow bg-gray-200">
      <aside className="hidden sm:block row-span-2">
        <FeedSidebar />
      </aside>
      <div className="px-4 py-1 flex items-center">
        <button
          type="button"
          className="sm:hidden icon-btn w-4 h-4 mr-4"
          title="Open list of the feeds"
          onClick={() => setModalOpen((prev) => !prev)}
        >
          <BarsIcon />
        </button>
        <h3 className="font-bold text-lg">Feed Title</h3>
      </div>
      <main className="min-h-full flex flex-col flex-grow space-y-4 p-3">
        <div className="p-2 shadow-message bg-white rounded-sm">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio libero quis nulla, ab nisi
          praesentium dolorem quae illum? Neque tempora, ipsum laudantium blanditiis rem laborum
          fuga, quo dolore numquam asperiores exercitationem. Nulla ratione ullam totam beatae,
          laudantium culpa cupiditate dignissimos sed quis itaque nihil rem porro voluptas earum
          nisi dolorem!
        </div>
      </main>
      <ModalSidebar
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        contentLabel="List of the feeds"
        right={false}
      >
        <FeedSidebar />
      </ModalSidebar>
    </section>
  );
};

export default FeedReader;

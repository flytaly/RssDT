import React from 'react';
import { useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/is-server';
import AddFeedForm from './add-feed-form';

const WelcomeCard = () => {
  const { data } = useMeQuery({ skip: isServer() });
  return (
    <article className="flex flex-col md:flex-row small-card-w w-96 bg-gray-200 rounded-md">
      <section className="flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
        Messages
      </section>
      <section className="flex-grow bg-gray-300 bg-opacity-60 rounded-md border-1 border-gray-500 border-solid border p-3 px-12 md:w-1/2">
        <h2 className="text-xl font-bold mb-4 text-center">Add a feed</h2>
        <AddFeedForm email={data?.me?.email} />
      </section>
    </article>
  );
};

export default WelcomeCard;

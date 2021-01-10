import React from 'react';

const WelcomeCard = () => {
  return (
    <article className="flex flex-col md:flex-row small-card-w w-96 bg-gray-200 rounded-md">
      <section className="flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
        Messages
      </section>
      <section className="flex-grow flex flex-col items-center bg-gray-300 bg-opacity-60 rounded-md border-1 border-gray-500 border-solid border p-3 px-12 md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Add a feed</h2>
        <input className="p-0.5 mb-4 w-full max-w-xs rounded-lg" type="text" />
        <input className="p-0.5 mb-4 w-full max-w-xs rounded-lg" type="text" />
        <input className="p-0.5 mb-4 w-full max-w-xs rounded-lg" type="text" />
        <button type="submit" className="btn w-full max-w-xs text-xl tracking-wider">
          subscribe
        </button>
      </section>
    </article>
  );
};

export default WelcomeCard;

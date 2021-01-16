import React from 'react';

const WelcomeCard: React.FC = ({ children }) => {
  return (
    <article className="flex flex-col md:flex-row small-card-w w-96 bg-gray-200 rounded-md">
      {children}
    </article>
  );
};

export default WelcomeCard;

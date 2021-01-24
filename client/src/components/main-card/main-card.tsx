import React from 'react';

interface MainCardProps {
  big?: boolean;
  children: React.ReactNode;
}

const MainCard: React.FC<MainCardProps> = ({ children, big = false }) => {
  const size = big ? 'big-card-w' : 'small-card-w';
  return (
    <article
      id="card-root"
      className={`relative flex flex-col md:flex-row ${size} min-h-100 bg-gray-200 rounded-md shadow-modal mx-auto`}
    >
      {children}
    </article>
  );
};

export default MainCard;

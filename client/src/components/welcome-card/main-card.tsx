import React from 'react';

interface MainCardProps {
  big?: boolean;
  children: React.ReactNode;
}

const MainCard: React.FC<MainCardProps> = ({ children, big = false }) => {
  const size = big ? 'big-card-w' : 'small-card-w';
  return (
    <article className={`flex flex-col md:flex-row ${size} min-h-84 bg-gray-200 rounded-md`}>
      {children}
    </article>
  );
};

export default MainCard;

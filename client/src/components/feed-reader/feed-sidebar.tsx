import React from 'react';

interface FeedSidebarProps {}

const FeedSidebar: React.FC<FeedSidebarProps> = () => {
  return (
    <nav className="w-full h-full bg-indigo-900 text-gray-50 py-2 pl-4 pr-1 overflow-hidden">
      <ul>
        <li className="whitespace-nowrap overflow-ellipsis overflow-hidden">
          <a href="/">Feed 1</a>
        </li>
        <li className="whitespace-nowrap overflow-ellipsis overflow-hidden">
          <a href="/">Feed 2</a>
        </li>
        <li className="whitespace-nowrap overflow-ellipsis overflow-hidden">
          <a href="/">Very very very looooooong name</a>
        </li>
      </ul>
    </nav>
  );
};

export default FeedSidebar;

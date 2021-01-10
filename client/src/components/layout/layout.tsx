import React from 'react';
import Meta from '../meta';
import Header from './header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Meta />
      <div className="flex justify-center max-w-screen min-h-screen bg-gradient-to-b from-gradFrom to-gradTo bg-fixed pt-2">
        <div className="flex flex-col flex-grow max-w-max">
          <Header />
          {children}
          <div className="flex-grow" />
          <footer className="text-center text-sm text-gray-400 mt-2">footer</footer>
        </div>
      </div>
    </>
  );
};

export default Layout;

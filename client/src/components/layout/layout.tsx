import React from 'react';
import Meta from '../meta';
import Header from './header';
import PageWrapper from './page-wrapper';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Meta />
      <Header />
      <PageWrapper>{children}</PageWrapper>
    </>
  );
};

export default Layout;

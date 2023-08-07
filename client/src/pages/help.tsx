import { NextPage } from 'next';
import React from 'react';

import HelpContent from '@/components/info/help-content';
import Layout from '@/components/layout/layout';
import InfoNavBar from '@/components/main-card/info-nav-bar';
import MainCard from '@/components/main-card/main-card';

const HelpPage: NextPage = () => {
  return (
    <Layout>
      <MainCard big>
        <div className="flex flex-col w-full h-full">
          <InfoNavBar />
          <section className="flex-grow">
            <HelpContent />
          </section>
        </div>
      </MainCard>
    </Layout>
  );
};

export default HelpPage;

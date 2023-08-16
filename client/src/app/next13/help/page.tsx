import React from 'react';

import MainCard from '@/app/main-card';
import InfoNavBar from '@/components/main-card/info-nav-bar';

import HelpContent from './help-content';

export default function HelpPage() {
  return (
    <MainCard big>
      <div className="flex flex-col w-full h-full">
        <InfoNavBar />
        <section className="flex-grow">
          {' '}
          <HelpContent />
        </section>
      </div>
    </MainCard>
  );
}

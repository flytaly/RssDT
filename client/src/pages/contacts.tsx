import { NextPage } from 'next';
import React from 'react';

import Contacts from '@/components/contacts';
import Layout from '@/components/layout/layout';
import InfoNavBar from '@/components/main-card/info-nav-bar';
import MainCard from '@/components/main-card/main-card';

const ContactsPage: NextPage = () => {
  return (
    <Layout>
      <MainCard big>
        <div className="flex flex-col w-full h-full">
          <InfoNavBar />
          <section className="flex-grow">
            <Contacts />
          </section>
        </div>
      </MainCard>
    </Layout>
  );
};

export default ContactsPage;

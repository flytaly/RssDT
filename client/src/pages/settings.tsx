import { NextPage } from 'next';
import React from 'react';
import Layout from '../components/layout/layout';
import MainCard from '../components/main-card/main-card';

const SettingsPage: NextPage = () => {
  return (
    <Layout>
      <MainCard big>
        <div className="w-full">
          <div className="flex flex-col w-full p-4">
            <h2 className="font-bold text-base">Info</h2>
            <h2 className="font-bold text-base">Digest Settings</h2>
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default SettingsPage;

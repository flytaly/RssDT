import { NextPage } from 'next';
import React from 'react';
import Layout from '../components/layout/layout';
import WelcomeCard from '../components/welcome-card/welcome-card';

const Login: NextPage = () => {
  return (
    <Layout>
      <WelcomeCard />
    </Layout>
  );
};

export default Login;

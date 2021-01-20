import { useApolloClient } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect } from 'react';
import Layout from '../components/layout/layout';
import WelcomeCard from '../components/welcome-card/welcome-card';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/is-server';

const Logout: NextPage = () => {
  const { data } = useMeQuery({ skip: isServer() });
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const client = useApolloClient();

  useEffect(() => {
    if (data?.me) {
      logout().then(() => {
        client.cache.reset();
        router.push('/', {});
      });
    } else {
      router.push('/');
    }
  }, []);

  return (
    <Layout>
      <WelcomeCard>
        <div className="p-12 w-full h-full text-center">
          <b className="text-2xl w-full text-center">Logging out...</b>
        </div>
      </WelcomeCard>
    </Layout>
  );
};

export default Logout;

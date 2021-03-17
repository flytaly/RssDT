import { useApolloClient } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect } from 'react';
import Layout from '../components/layout/layout';
import MainCard from '../components/main-card/main-card';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

const Logout: NextPage = () => {
  const { data } = useMeQuery({ ssr: false });
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
  }, [client.cache, data?.me, logout, router]);

  return (
    <Layout>
      <MainCard>
        <div className="p-12 w-full h-full text-center">
          <b className="text-2xl w-full text-center">Logging out...</b>
        </div>
      </MainCard>
    </Layout>
  );
};

export default Logout;

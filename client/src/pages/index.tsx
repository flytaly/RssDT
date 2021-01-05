import { NextPage } from 'next';
import Head from 'next/head';
import { useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/is-server';

const Home: NextPage = () => {
  const { data, loading } = useMeQuery({ skip: isServer() });
  let status: JSX.Element | null = null;
  if (loading) status = <div />;
  else if (data?.me) {
    status = <div>{`Logged in (${data?.me.email})`}</div>;
  } else {
    status = <div>Logged out</div>;
  }
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{status}</main>
    </div>
  );
};

export default Home;

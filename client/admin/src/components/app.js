import React from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import { Icon, Layout } from 'antd';
import AppLayout from './app-layout';
import apolloClient from '../lib/apollo-client';
import Authorize from './auth';
import Login from './login';

const Loading = () => (
    <Layout style={{ textAlign: 'center', paddingTop: 36, minHeight: '100vh' }}>
        <Icon style={{ fontSize: 36 }} type="loading" />
    </Layout>);

const App = () => (
    <ApolloProvider client={apolloClient}>
        <Authorize>
            {({ loading, needLogin }) => {
                if (loading) return <Loading />;
                if (needLogin) return <Login />;
                return <AppLayout />;
            }}
        </Authorize>
    </ApolloProvider>
);

export default App;

import React from 'react';
import App from 'next/app';
// import { ApolloProvider } from 'react-apollo';
// import withApollo from '../lib/with-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import Page from '../components/page';
import withApolloHooks from '../lib/with-apollo-hooks';
import { StateProvider } from '../components/state';

class MyApp extends App {
    static async getInitialProps({ Component, ctx }) {
        let pageProps = {};
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }
        pageProps.query = ctx.query;
        return { pageProps };
    }

    render() {
        const { Component, pageProps, apolloClient } = this.props;

        return (
            <ApolloHooksProvider client={apolloClient}>
                <StateProvider>
                    <Page>
                        <Component {...pageProps} />
                    </Page>
                </StateProvider>
            </ApolloHooksProvider>
        );
    }
}

export default withApolloHooks(MyApp);

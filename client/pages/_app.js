import React from 'react';
import App, { Container } from 'next/app';
// import { ApolloProvider } from 'react-apollo';
// import withApollo from '../lib/with-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import Page from '../components/page';
import withApolloClient from '../lib/with-apollo-client';

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
            <Container>
                <ApolloHooksProvider client={apolloClient}>
                    <Page>
                        <Component {...pageProps} />
                    </Page>
                </ApolloHooksProvider>
            </Container>
        );
    }
}

export default withApolloClient(MyApp);

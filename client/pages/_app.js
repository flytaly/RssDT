import React from 'react';
import App, { Container } from 'next/app';
// import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import Page from '../components/page';
import withApollo from '../lib/with-apollo';

class MyApp extends App {
    render() {
        const { Component, pageProps, apollo } = this.props;

        return (
            <Container>
                {/* <ApolloProvider client={apollo}> */}
                <ApolloHooksProvider client={apollo}>
                    <Page>
                        <Component {...pageProps} />
                    </Page>
                </ApolloHooksProvider>
                {/* </ApolloProvider> */}
            </Container>
        );
    }
}

export default withApollo(MyApp);

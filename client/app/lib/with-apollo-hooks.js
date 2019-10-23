import React from 'react';
import Head from 'next/head';
// import { getDataFromTree } from 'react-apollo';
import { getMarkupFromTree } from 'react-apollo-hooks';
import { renderToStaticMarkup } from 'react-dom/server';
import initApollo from './init-apollo';

export default App => class Apollo extends React.Component {
    // eslint-disable-next-line react/static-property-placement
    static displayName = 'withApollo(App)'

    static async getInitialProps(ctx) {
        const { Component, router, ctx: { req } } = ctx;

        let appProps = {};
        if (App.getInitialProps) {
            appProps = await App.getInitialProps(ctx);
        }

        // Run all GraphQL queries in the component tree
        // and extract the resulting data
        const cookie = req && req.headers.cookie;
        const apollo = initApollo(null, { cookie });
        if (!process.browser) {
            try {
                // Run all GraphQL queries
                await getMarkupFromTree({
                    renderFunction: renderToStaticMarkup,
                    tree: <App
                        {...appProps}
                        Component={Component}
                        router={router}
                        apolloClient={apollo}
                    />,
                });
            } catch (error) {
                // Prevent Apollo Client GraphQL errors from crashing SSR.
                // Handle them in components via the data.error prop:
                // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
                if (error.message !== 'GraphQL error: Authentication is required') {
                    console.error('Error while running `getMarkupFromTree`', error);
                }
            }

            // getDataFromTree does not call componentWillUnmount
            // head side effect therefore need to be cleared manually
            Head.rewind();
        }

        // Extract query data from the Apollo store
        const apolloState = apollo.cache.extract();

        return {
            ...appProps,
            apolloState,
        };
    }

    constructor(props) {
        super(props);
        // eslint-disable-next-line react/prop-types
        this.apolloClient = initApollo(props.apolloState);
    }

    render() {
        return <App {...this.props} apolloClient={this.apolloClient} />;
    }
};

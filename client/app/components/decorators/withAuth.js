import React, { useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'react-apollo-hooks';
import Router from 'next/router';
import get from 'lodash.get';
import { ME_QUERY, UPDATE_MY_INFO_MUTATION } from '../../queries';
import StyledCard from '../styled/card';

const updateMe = (dataProxy, mutationResult) => {
    try {
        const { locale, timeZone } = mutationResult.data.updateMyInfo;
        const data = dataProxy.readQuery({ query: ME_QUERY });
        if (data.me.timeZone !== timeZone || data.me.locale !== locale) {
            data.me = { ...data.me, timeZone, locale };
            dataProxy.writeQuery({ query: ME_QUERY, data });
        }
    } catch (e) {
        console.error(e);
    }
};

/**
 * @param {boolean} redirectOnFail - Redirect to /login if user isn't authenticated
 * @returns {function} HOC that fetches user info and pass it as 'me' prop to the wrapped component
 */
const withAuth = (redirectOnFail = false) => (Component) => {
    const WrappingComponent = (props) => {
        const { data, error } = useQuery(ME_QUERY);
        const me = get(data, 'me', {});

        const updateMyInfo = useMutation(UPDATE_MY_INFO_MUTATION, { update: updateMe });
        const updateMutation = useCallback(({ timeZone, locale }) => {
            updateMyInfo({
                variables: { data: { timeZone, locale } },
                optimisticResponse: { __typename: 'Mutation', updateMyInfo: { __typename: 'User', ...me, timeZone, locale } },
            }).catch(e => console.error(e));
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [me.locale, me.timeZone]);
        useEffect(() => {
            if (!me.locale || !me.timeZone) return;

            if (Intl && Intl.DateTimeFormat) {
                const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
                if (!timeZone || !locale) return;
                if (me.timeZone !== timeZone || me.locale !== locale) {
                    updateMutation({ timeZone, locale });
                }
            }
        }, [me.locale, me.timeZone, updateMutation]);

        const redirectPath = '/login';
        if (error) {
            if (error.message !== 'GraphQL error: Authentication is required') {
                console.error(error.message);
            }
            if (Router.pathname !== redirectPath && redirectOnFail) {
                Router.replace(redirectPath);
            }
        }

        if (redirectOnFail && !data.me) {
            return <StyledCard><h1>You are not logged in. Redirect...</h1></StyledCard>;
        }

        return <Component {...props} me={data.me} />;
    };

    WrappingComponent.getInitialProps = Component.getInitialProps;

    return WrappingComponent;
};

export default withAuth;

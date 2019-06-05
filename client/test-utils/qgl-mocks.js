/* eslint-disable import/prefer-default-export */
import ME_QUERY from '../queries/me-query';
import UPDATE_MY_INFO_MUTATION from '../queries/update-my-info-mutation';

const user = { id: 'id', email: 'email@test.com', timeZone: 'GMT', locale: 'en-GB', dailyDigestHour: 18 };
const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();

export const ME_QUERY_MOCK = {
    request: { query: ME_QUERY },
    result: { data: { me: user } },
};

export const UPDATE_MY_INFO_MOCK = {
    request: {
        query: UPDATE_MY_INFO_MUTATION,
        variables: { data: { timeZone, locale } },
    },
    result: { data: { updateMyInfo: { ...user, timeZone, locale } } },
};

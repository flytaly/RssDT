import Router from 'next/router';
import { useEffect } from 'react';
import { MeDocument, MeQuery, useMeQuery, useUpdateUserInfoMutation } from '../generated/graphql';
import { getUserLocaleInfo } from './user-locale';

/**
 * Redirect if user isn't authenticated.
 * Also check user's locale and timeZone and update information on the server.
 */
const useAuthRoute = () => {
  const { data, loading } = useMeQuery();
  const [updateInfo] = useUpdateUserInfoMutation();

  useEffect(() => {
    if (loading) return;
    if (!data?.me) {
      Router.push('/login');
      return;
    }
    const info = getUserLocaleInfo();
    if (info) {
      const { locale, timeZone } = info;
      if (locale !== data.me.locale || timeZone !== data.me.timeZone) {
        updateInfo({
          variables: { userInfo: { locale, timeZone } },
          update: (cache, result) => {
            const res = result?.data?.updateUserInfo;
            if (!res?.locale) return;
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const { locale, timeZone } = res;
            const prevMeQuery = cache.readQuery<MeQuery>({ query: MeDocument });
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: 'Query',
                me: { ...prevMeQuery?.me, locale, timeZone },
              } as MeQuery,
            });
          },
        });
      }
    }
  }, [data?.me, loading, updateInfo]);
};

export default useAuthRoute;

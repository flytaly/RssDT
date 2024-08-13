import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { MeQuery, UserInfoInput } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';
import { getUserLocaleInfo } from '@/utils/user-locale';

/**
 * Redirect if user isn't authenticated.
 * Also check user's locale and timeZone and update information on the server.
 */
export function useRedirectUnauthorized() {
  const { data, isPending } = useQuery({
    queryKey: ['me'],
    queryFn: async () => getGQLClient().me(),
    retry: false,
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateInfo = useMutation({
    mutationFn: async (userInfo: UserInfoInput) => {
      const { updateUserInfo } = await getGQLClient().updateUserInfo({ userInfo });
      if (!updateUserInfo) return;
      const { locale, timeZone } = updateUserInfo;
      queryClient.setQueryData<MeQuery>(['me'], (oldData) => {
        if (!oldData?.me) return oldData;
        const updatedMe = { ...oldData.me, locale, timeZone };
        return { ...oldData, me: updatedMe };
      });
    },
  });

  useEffect(() => {
    if (isPending) return;
    if (!data?.me) {
      router.push('/login');
      return;
    }
    if (updateInfo.isSuccess || updateInfo.isError || updateInfo.isPending) return;
    const info = getUserLocaleInfo();
    if (!info) return;
    const { locale, timeZone } = info;
    if (locale === data.me.locale && timeZone === data.me.timeZone) return;
    updateInfo.mutate({ locale, timeZone });
  }, [data?.me, isPending, router, updateInfo]);

  return { me: data?.me, isPending };
}

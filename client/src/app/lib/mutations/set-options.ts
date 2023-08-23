import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getGQLClient } from '@/app/lib/gqlClient.client';
import { MyOptionsQuery, OptionsInput } from '@/gql/generated';

export function useSetOptionsMutation() {
  const queryKey = ['myOptions'];
  const queryClient = useQueryClient();
  const gqlClient = getGQLClient();
  const mut = useMutation({
    onMutate: async (newOpts) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousOptions = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<MyOptionsQuery>(queryKey, (old) => {
        const myOptions = { ...(old?.myOptions || {}), ...newOpts };
        return { ...old, myOptions } as MyOptionsQuery;
      });

      // Return a context object with the snapshotted value
      return { previousOptions };
    },

    mutationFn: async (opts: OptionsInput) => gqlClient.setOptions({ opts }),

    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousOptions);
    },

    onSuccess: (data) => {
      if (!data.setOptions.options) return;
      queryClient.setQueryData<MyOptionsQuery>(['myOptions'], (oldData) => {
        if (!oldData) return oldData;
        const myOptions = { ...oldData.myOptions, ...data.setOptions.options };
        return { ...oldData, myOptions };
      });
    },
  });

  return mut;
}

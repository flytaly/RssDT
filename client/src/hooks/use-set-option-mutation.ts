import {
  MyOptionsDocument,
  MyOptionsQuery,
  OptionsFieldsFragment,
  OptionsInput,
  SetOptionsMutation,
  useSetOptionsMutation,
} from '@/generated/graphql';

type OptionsKey = keyof OptionsInput;

const keys = [
  'attachmentsDefault',
  'customSubject',
  'dailyDigestHour',
  'itemBodyDefault',
  'shareEnable',
  'shareList',
  'themeDefault',
  'withContentTableDefault',
] as Array<OptionsKey>;

export function useSetPartialOptionsMutation() {
  const [setOptions, mutationOptions] = useSetOptionsMutation();

  const setOptionMutation = async (
    key: OptionsKey,
    value: any,
    prevOptions: OptionsFieldsFragment,
  ): Promise<{ error?: string; data?: SetOptionsMutation | null }> => {
    if (!keys.includes(key)) return { error: 'unexpected key' };
    const newOption = { [key]: value };
    try {
      const { data } = await setOptions({
        variables: { opts: newOption },
        optimisticResponse: {
          __typename: 'Mutation',
          setOptions: {
            __typename: 'OptionsResponse',
            errors: null,
            options: {
              __typename: 'Options',
              ...prevOptions,
              ...newOption,
            },
          },
        },
        update: (cache, result) => {
          const $opts = result.data?.setOptions.options;
          if ($opts) {
            const prevQuery = cache.readQuery<MyOptionsQuery>({ query: MyOptionsDocument });
            const prevOpts = prevQuery?.myOptions;
            cache.writeQuery<MyOptionsQuery>({
              query: MyOptionsDocument,
              data: {
                __typename: 'Query',
                myOptions: { ...prevOpts, ...$opts },
              } as MyOptionsQuery,
            });
          }
        },
      });
      if (data?.setOptions.errors) return { error: data?.setOptions.errors[0].message };
      return { data };
    } catch (error) {
      return { error: (error as { message: string }).message };
    }
  };

  return [setOptionMutation, mutationOptions] as const;
}

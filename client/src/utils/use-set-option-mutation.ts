import { Options } from 'graphql/utilities/extendSchema';
import {
  useSetOptionsMutation,
  OptionsInput,
  MyOptionsQuery,
  MyOptionsDocument,
  SetOptionsMutation,
  OptionsFieldsFragment,
} from '../generated/graphql';

type OptionsKey = keyof OptionsInput;

const keys = ['dailyDigestHour'] as Array<OptionsKey>;

const convertValue = (key: OptionsKey, value: string) => {
  if (key === 'dailyDigestHour') return parseInt(value);
  return value;
};

export function useSetPartialOptionsMutation() {
  const [setOptions, mutationOptions] = useSetOptionsMutation();

  const setOptionMutation = async (
    key: OptionsKey,
    value: string,
    prevOptions: OptionsFieldsFragment,
  ): Promise<{ error?: string; data?: SetOptionsMutation | null }> => {
    const valueToSave = convertValue(key, value);
    if (!keys.includes(key)) return { error: 'unexpected key' };
    const newOption = { [key]: valueToSave };
    try {
      const { data } = await setOptions({
        variables: { opts: newOption },
        optimisticResponse: {
          __typename: 'Mutation',
          setOptions: {
            __typename: 'OptionsResponse',
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
            const prevOpts = prevQuery?.myOptions as Options;
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
      return { error: error.message };
    }
  };

  return [setOptionMutation, mutationOptions] as const;
}

import { NextPage } from 'next';
import React, { useState } from 'react';
import SelectUnderline from '../components/forms/select-underline';
import Layout from '../components/layout/layout';
import MainCard from '../components/main-card/main-card';
import SettingsNavBar from '../components/main-card/settings-nav-bar';
import Spinner from '../components/spinner';
import { OptionsInput, useMeQuery, useMyOptionsQuery } from '../generated/graphql';
import { useSetPartialOptionsMutation } from '../utils/use-set-option-mutation';

const Item: React.FC<{ title: React.ReactNode; error?: string; saving?: boolean }> = ({
  children,
  title,
  error,
  saving,
}) => (
  <article className="relative by-2 py-2 border-b border-gray-300">
    <h3 className="font-semibold mb-1">{title}</h3>
    <div className="font-light text-sm">{children}</div>
    {error ? <div className="font-light text-sm mb-1 text-error">{error}</div> : null}
    {saving ? (
      <div className="absolute right-1 top-2">
        <Spinner />
      </div>
    ) : null}
  </article>
);

const range = (start = 0, stop = 23) => Array.from({ length: stop - start + 1 }, (_, i) => i);

const SettingsPage: NextPage = () => {
  const meData = useMeQuery();
  const { data, loading } = useMyOptionsQuery();
  const [itemSaving, setItemSaving] = useState<Partial<Record<keyof OptionsInput, boolean>>>({});
  const [itemError, setItemError] = useState<Partial<Record<keyof OptionsInput, string>>>({});
  const [saveOptions] = useSetPartialOptionsMutation();

  if (!meData.data?.me) return null;
  const { email, timeZone, locale } = meData.data.me;
  const opts = data?.myOptions;

  const onChange = async ({ target }: React.ChangeEvent<HTMLSelectElement>) => {
    const name = target.name as keyof OptionsInput;
    setItemSaving({ [name]: true });
    const { error } = await saveOptions(name, target.value, opts!);
    if (error) setItemError({ [name]: error });
    else setItemError({});
    setItemSaving({});
  };

  return (
    <Layout>
      <MainCard big>
        <div className="w-full pb-4">
          <SettingsNavBar />
          <div className="mx-auto w-160 max-w-full">
            <section className="flex flex-col p-4">
              <h2 id="info" className="font-bold text-base my-2 border-b border-gray-300">
                Account Information
              </h2>
              <Item title="Email">{email}</Item>
              <Item title="Timezone">{timeZone}</Item>
              <Item title="Locale">{locale}</Item>
            </section>
            {loading ? (
              'loading'
            ) : (
              <section className="flex flex-col w-full p-4">
                <h2 id="digest" className="font-bold text-base my-2 border-b border-gray-300">
                  Digest Settings
                </h2>
                <Item
                  title="Daily digest hour"
                  error={itemError.dailyDigestHour}
                  saving={itemSaving.dailyDigestHour}
                >
                  <div>Select the hour you want to receive daily digests:</div>
                  <div className="w-24">
                    <SelectUnderline
                      name="dailyDigestHour"
                      onChange={onChange}
                      value={opts?.dailyDigestHour}
                      className="text-xs mt-2"
                      disabled={itemSaving.dailyDigestHour}
                    >
                      {range(0, 23).map((hour) => (
                        <option key={hour} value={hour}>{`${hour}:00`}</option>
                      ))}
                    </SelectUnderline>
                  </div>
                </Item>
              </section>
            )}
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default SettingsPage;

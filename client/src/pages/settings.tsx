import { NextPage } from 'next';
import React, { useState } from 'react';
import { LabeledCheckbox } from '../components/forms/checkbox';
import EditEmailSubject from '../components/forms/edit-email-subject';
import SelectUnderline from '../components/forms/select-underline';
import Layout from '../components/layout/layout';
import MainCard from '../components/main-card/main-card';
import SettingsNavBar from '../components/main-card/settings-nav-bar';
import Item from '../components/settings-item';
import {
  Options,
  OptionsInput,
  ShareId,
  Theme,
  useMeQuery,
  useMyOptionsQuery,
  useDeleteMeMutation,
} from '../generated/graphql';
import shareProviders from '../share-providers';
import useAuthRoute from '../hooks/use-auth-route';
// import { ShareId } from '../types';
import { useSetPartialOptionsMutation } from '../hooks/use-set-option-mutation';
import Spinner from '../components/spinner';
import { useRouter } from 'next/router';

const range = (start = 0, stop = 23) => Array.from({ length: stop - start + 1 }, (_, i) => i);

const isShareChecked = ({ shareEnable, shareList }: Options, current: ShareId) => {
  if (!shareEnable) return false;
  if (shareList?.length) {
    return shareList.includes(current);
  }
  return true;
};

const shareIdsList = shareProviders.map(({ id }) => id);

const SettingsPage: NextPage = () => {
  useAuthRoute();
  const meData = useMeQuery();
  const { data, loading } = useMyOptionsQuery();
  const [deleteMe, deleteMeResult] = useDeleteMeMutation();
  const router = useRouter();
  const [itemSaving, setItemSaving] = useState<Partial<Record<keyof OptionsInput, boolean>>>({});
  const [itemError, setItemError] = useState<Partial<Record<keyof OptionsInput, string>>>({});
  const [saveOptions] = useSetPartialOptionsMutation();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);

  if (!meData.data?.me) return null;
  const { email, timeZone, locale } = meData.data.me;
  const opts = data?.myOptions;

  const save = async (name: keyof OptionsInput, value: any) => {
    setItemSaving({ [name]: true });
    const { error } = await saveOptions(name, value, opts!);
    if (error) setItemError({ [name]: error });
    else setItemError({});
    setItemSaving({});
  };

  const saveShare = async (shareId: ShareId, checked: boolean) => {
    let nextShare: ShareId[];
    if (!opts?.shareList?.length && !checked) {
      nextShare = shareIdsList.filter((s) => s !== shareId);
    } else {
      const prevShare = [...(opts?.shareList || [])];
      if (checked) {
        nextShare = !prevShare.includes(shareId) ? [...prevShare, shareId] : prevShare;
      } else {
        nextShare = prevShare.filter((s) => s !== shareId);
      }
    }
    await save('shareList', nextShare);
  };

  const showAccDeletionBlock = () => {
    setDeleteConfirmation(true);
    setTimeout(() => setIsDeleteDisabled(false), 1000);
  };

  const hideAccDeletionBlock = () => {
    setDeleteConfirmation(false);
    setIsDeleteDisabled(true);
  };

  const deleteAndLogout = async () => {
    const res = await deleteMe();
    if (res.data?.deleteUser.message == 'OK') {
      router.replace('/logout');
    }
  };

  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="w-full pb-20">
          <SettingsNavBar />
          <div className="mx-auto w-160 max-w-full">
            <section className="flex flex-col p-4">
              <h2 id="info" className="font-bold text-base my-2 border-b border-gray-300">
                Account Information and Settings
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
                      onChange={(e) => save('dailyDigestHour', parseInt(e.target.value))}
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
                <Item
                  title="Default theme"
                  error={itemError.themeDefault}
                  saving={itemSaving.themeDefault}
                >
                  <div>Select default email digest theme:</div>
                  <div className="w-24">
                    <SelectUnderline
                      name="themeDefault"
                      onChange={(e) => save('themeDefault', e.target.value)}
                      value={opts?.themeDefault}
                      className="text-xs mt-2"
                      disabled={itemSaving.themeDefault}
                    >
                      <option value={Theme.Default}>Default</option>
                      <option value={Theme.Text}>Text</option>
                    </SelectUnderline>
                  </div>
                </Item>
                <Item
                  title="Table of Content"
                  error={itemError.withContentTableDefault}
                  saving={itemSaving.withContentTableDefault}
                >
                  <LabeledCheckbox
                    id="withContentTableDefault"
                    checked={opts?.withContentTableDefault}
                    onChange={(e) => save('withContentTableDefault', e.target.checked)}
                    disabled={itemSaving.withContentTableDefault}
                    labelContent="Include table of content"
                  />
                </Item>
                <Item
                  title="Feed items content"
                  error={itemError.itemBodyDefault}
                  saving={itemSaving.itemBodyDefault}
                >
                  <LabeledCheckbox
                    id="itemBodyDefault"
                    checked={opts?.itemBodyDefault}
                    onChange={(e) => save('itemBodyDefault', e.target.checked)}
                    disabled={itemSaving.itemBodyDefault}
                    labelContent="Show items content"
                  />
                </Item>
                <Item
                  title="Attachments"
                  error={itemError.attachmentsDefault}
                  saving={itemSaving.attachmentsDefault}
                >
                  <LabeledCheckbox
                    id="attachmentsDefault"
                    checked={!!opts?.attachmentsDefault}
                    onChange={(e) => save('attachmentsDefault', e.target.checked)}
                    labelContent="Include links to attachments (RSS enclosures)"
                    disabled={itemSaving.attachmentsDefault}
                  />
                </Item>
                <Item
                  title="Links to online services"
                  error={itemError.shareList || itemError.shareEnable}
                  saving={itemSaving.shareList || itemSaving.shareEnable}
                >
                  <LabeledCheckbox
                    id="shareEnable"
                    labelContent="Include share providers in the digest:"
                    checked={opts?.shareEnable}
                    onChange={(e) => save('shareEnable', e.target.checked)}
                    disabled={itemSaving.shareEnable || itemSaving.shareList}
                  />
                  <div className="ml-5">
                    {shareProviders.map((share) => {
                      return (
                        <LabeledCheckbox
                          key={share.id}
                          id={share.id}
                          checked={opts && isShareChecked(opts, share.id)}
                          onChange={(e) => saveShare(share.id, e.target.checked)}
                          disabled={
                            !opts?.shareEnable || itemSaving.shareEnable || itemSaving.shareList
                          }
                          labelContent={
                            <div className="flex items-center">
                              <img
                                className="h-4 w-auto m-1"
                                src={share.iconUrl}
                                alt="share provider"
                              />
                              <span>{share.title}</span>
                            </div>
                          }
                        />
                      );
                    })}
                  </div>
                </Item>
                <Item
                  title="Edit email subject"
                  error={itemError.customSubject}
                  saving={itemSaving.customSubject}
                >
                  <EditEmailSubject
                    value={opts?.customSubject}
                    loading={itemSaving.customSubject}
                    onSave={(value) => save('customSubject', value)}
                  />
                </Item>
              </section>
            )}
            <section className="mt-10">
              <h2 id="actions" className="font-bold text-base my-2 border-b border-gray-300">
                Actions
              </h2>
              <Item title="Deletion">
                {!deleteConfirmation ? (
                  <button
                    type="button"
                    onClick={showAccDeletionBlock}
                    className="p-1 border-2 border-gray hover:text-red-600 hover:border-red-600 active:brightness-125"
                  >
                    Delete the account
                  </button>
                ) : (
                  <div className="text-lg w-full text-center">
                    <div className="font-bold text-red-600">
                      Are you sure you want want to delete your account?
                    </div>
                    <div className="flex space-x-8 mt-4 justify-center">
                      <button
                        className="border-2 border-gray text-black px-2 hover:border-black active:border-gray"
                        onClick={hideAccDeletionBlock || deleteMeResult.loading}
                      >
                        Cancel
                      </button>
                      <button
                        className="border-2 border-red-600 text-red-600 px-2 hover:border-primary hover:text-primary active:brightness-125 disabled:text-gray-500 disabled:border-gray-500 transition-colors"
                        onClick={() => deleteAndLogout()}
                        disabled={isDeleteDisabled}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {deleteMeResult.loading ? <Spinner /> : null}
                      <div>
                        {deleteMeResult.data?.deleteUser.message || deleteMeResult.error?.message}
                      </div>
                    </div>
                  </div>
                )}
              </Item>
            </section>
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default SettingsPage;

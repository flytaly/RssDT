'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import BigCard from '@/app/components/card/big-card';
import SettingsNavBar from '@/app/components/card/settings-nav-bar';
import { useRedirectUnauthorized } from '@/app/hooks/useRedirectUnauthorized';
import { getGQLClient } from '@/app/lib/gqlClient.client';
import { useSetOptionsMutation } from '@/app/lib/mutations/set-options';
import { LabeledCheckbox } from '@/components/forms/checkbox';
import EditEmailSubject from '@/components/forms/edit-email-subject';
import SelectUnderline from '@/components/forms/select-underline';
import Item from '@/components/settings-item';
import Spinner from '@/components/spinner';
import { Options, OptionsInput, ShareId, Theme } from '@/gql/generated';
import shareProviders from '@/share-providers';

const range = (start = 0, stop = 23) => Array.from({ length: stop - start + 1 }, (_, i) => i);

const isShareChecked = ({ shareEnable, shareList }: Options, current: ShareId) => {
  if (!shareEnable) return false;
  if (shareList?.length) {
    return shareList.includes(current);
  }
  return true;
};

const shareIdsList = shareProviders.map(({ id }) => id);

export default function SettingsPage() {
  const me = useRedirectUnauthorized();
  const { data, isLoading } = useQuery(['myOptions'], async () => getGQLClient().myOptions());
  const deleteMe = useMutation({
    mutationFn: async () => {
      return getGQLClient().deleteMe();
    },
  });
  const [itemSaving, setItemSaving] = useState<Partial<Record<keyof OptionsInput, boolean>>>({});
  const [itemError, setItemError] = useState<Partial<Record<keyof OptionsInput, string>>>({});
  const saveOptionsMutation = useSetOptionsMutation();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const queryClient = useQueryClient();

  if (!me.me) return null;

  const { email, timeZone, locale } = me.me;
  const opts = data?.myOptions;

  const save = async (name: keyof OptionsInput, value: any) => {
    setItemSaving({ [name]: true });
    const { setOptions } = await saveOptionsMutation.mutateAsync({
      [name]: value,
    });
    setItemSaving({});
    if (setOptions.errors) {
      setItemError({ [name]: setOptions.errors[0].message });
      return;
    }
    setItemError({});
  };

  const saveShare = async (shareId: ShareId, checked: boolean) => {
    let nextShare: ShareId[];

    if (!opts?.shareList?.length && !checked) {
      nextShare = shareIdsList.filter((s) => s !== shareId);
      return save('shareList', nextShare);
    }

    const prevShare = [...(opts?.shareList || [])];
    if (checked) {
      nextShare = !prevShare.includes(shareId) ? [...prevShare, shareId] : prevShare;
    } else {
      nextShare = prevShare.filter((s) => s !== shareId);
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
    const res = await deleteMe.mutateAsync();
    if (res.deleteUser.message == 'OK') {
      queryClient.invalidateQueries(['me']);
    }
  };

  return (
    <BigCard verificationWarning={!me.isLoading && !me.me?.emailVerified}>
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
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <span>Loading</span>
              <Spinner />
            </div>
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
                    {deleteMe.isLoading ? <Spinner /> : null}
                    <div>
                      {deleteMe.data?.deleteUser.message || (deleteMe.error as Error)?.message}
                    </div>
                  </div>
                </div>
              )}
            </Item>
          </section>
        </div>
      </div>
    </BigCard>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import Link from 'next/link';
import React, { useState } from 'react';

import EmailIcon from '@/assets/envelope.svg';
import GraphQLError from '@/components/graphql-error';
import { TernaryState, Theme, UserFeed } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';
import { useSetFeedOptionsMutation } from '@/lib/mutations/set-feed-options';
import { DigestSchedule, periodNames } from '@/types';

import InputUnderline, { InputUnderlineProps } from './input-underline';
import SelectUnderline, { SelectProps } from './select-underline';

interface InputProps {
  children: React.ReactNode;
  title: string;
}

const LabeledSelect = ({ title, children, ...props }: InputProps | SelectProps) => (
  <label className="flex mb-3">
    <b className="font-medium" style={{ minWidth: '40%' }}>
      {title}
    </b>
    <span className="ml-2 flex-1">
      <SelectUnderline {...props}>{children}</SelectUnderline>
    </span>
  </label>
);

const LabeledInput = ({ title, children, ...props }: InputProps | InputUnderlineProps) => (
  <label className="flex mb-3">
    <b className="font-medium" style={{ minWidth: '30%' }}>
      {title}
    </b>
    <span className="ml-2 flex-1">
      <InputUnderline {...props} className="w-full">
        {children}
      </InputUnderline>
    </span>
  </label>
);

interface FeedOptionsFormProps {
  feed: UserFeed | null;
}

const formatDefault = (defaultValue?: boolean | null) => {
  return defaultValue === undefined || defaultValue === null
    ? 'Default'
    : `Default (${defaultValue ? 'Enable' : 'Disable'})`;
};

const FeedOptionsForm = ({ feed }: FeedOptionsFormProps) => {
  const { data } = useQuery({
    queryKey: ['myOptions'],
    queryFn: () => getGQLClient().myOptions(),
  });
  const { withContentTableDefault, attachmentsDefault, itemBodyDefault } = data?.myOptions || {};

  const setOptsMutation = useSetFeedOptionsMutation();
  const [errorMsg, setErrorMsg] = useState('');

  if (!feed) return null;
  const { id, attachments, itemBody, schedule, theme, withContentTable, filter, title } = feed;
  return (
    <Formik
      initialValues={{ attachments, itemBody, schedule, theme, withContentTable, filter, title }}
      onSubmit={async (opts, { setSubmitting }) => {
        setSubmitting(true);
        try {
          const res = await setOptsMutation.mutateAsync({ id, opts });
          setErrorMsg(res?.errors?.[0].message || '');
        } catch (error) {
          setErrorMsg((error as { message: string }).message);
        }
        setSubmitting(false);
      }}
    >
      {({ values, handleChange, handleSubmit, isSubmitting }) => (
        <form className="flex flex-col" method="post" onSubmit={handleSubmit}>
          <h4 className="flex items-center font-semibold pl-2 mb-3 text-base bg-primary-2">
            Feed settings
          </h4>
          <LabeledInput
            name="title"
            title="Title"
            placeholder={feed.feed.title || ''}
            value={values.title || ''}
            onChange={handleChange}
            maxLength={50}
          />

          <h4 className="flex items-center font-semibold pl-2 mb-3 text-base bg-primary-2">
            <EmailIcon className="h-4 mr-1" />
            Email digest settings
          </h4>
          <LabeledSelect
            name="schedule"
            title="Email Digest"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.schedule}
          >
            {Object.values(DigestSchedule).map((sc) => (
              <option key={sc} value={sc}>{`${periodNames[sc]} digest`}</option>
            ))}
            <option key="disable" value="disable">
              disabled
            </option>
          </LabeledSelect>
          <LabeledSelect
            name="theme"
            title="Theme"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.theme}
          >
            <option value={Theme.Default}>Default</option>
            <option value={Theme.Text}>Text</option>
          </LabeledSelect>
          <LabeledSelect
            name="withContentTable"
            title="Table of Content"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.withContentTable}
          >
            <option value={TernaryState.Default}>{formatDefault(withContentTableDefault)}</option>
            <option value={TernaryState.Disable}>Disable</option>
            <option value={TernaryState.Enable}>Enable</option>
          </LabeledSelect>
          <LabeledSelect
            name="attachments"
            title="Attachments"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.attachments}
          >
            <option value={TernaryState.Default}>{formatDefault(attachmentsDefault)}</option>
            <option value={TernaryState.Disable}>Disable</option>
            <option value={TernaryState.Enable}>Enable</option>
          </LabeledSelect>
          <LabeledSelect
            name="itemBody"
            title="Feed items content"
            onChange={handleChange}
            disabled={isSubmitting}
            value={values.itemBody}
          >
            <option value={TernaryState.Default}>{formatDefault(itemBodyDefault)}</option>
            <option value={TernaryState.Disable}>Disable</option>
            <option value={TernaryState.Enable}>Enable</option>
          </LabeledSelect>
          <div className="mb-3">
            <div>
              <b>Filter items. </b>
              <span className="text-xs">
                Words and phrases separated by commas that should be contained in the titles of the
                items.
                <Link href="/help#filter" className="underline ml-1">
                  More info
                </Link>
              </span>
            </div>
            <InputUnderline
              name="filter"
              title="Filter items"
              className="w-full px-2 font-medium bg-gray-50"
              value={values.filter || ''}
              onChange={handleChange}
              maxLength={250}
              disabled={isSubmitting}
            />
          </div>
          {errorMsg ? (
            <div className="text-error my-2">
              <GraphQLError error={errorMsg} />
            </div>
          ) : null}
          <button type="submit" className="btn bg-primary w-36" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default FeedOptionsForm;

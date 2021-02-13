/* eslint-disable jsx-a11y/label-has-associated-control */
import { Formik } from 'formik';
import Link from 'next/link';
import React, { useState } from 'react';
import {
  TernaryState,
  Theme,
  useMyOptionsQuery,
  UserFeed,
  useSetFeedOptionsMutation,
} from '../../generated/graphql';
import { DigestSchedule, periodNames } from '../../types';
import GraphQLError from '../graphql-error';
import InputUnderline from './input-underline';
import SelectUnderline, { SelectProps } from './select-underline';

interface FeedOptionsFormProps {
  feed: UserFeed | null;
}

const LabeledSelect: React.FC<{ title: string } | SelectProps> = ({
  title,
  children,
  ...props
}) => (
  <label className="flex mb-3">
    <b className="font-medium" style={{ minWidth: '40%' }}>
      {title}
    </b>
    <span className="ml-2 flex-1">
      <SelectUnderline {...props}>{children}</SelectUnderline>
    </span>
  </label>
);

const FeedOptionsForm: React.FC<FeedOptionsFormProps> = ({ feed }) => {
  const { data } = useMyOptionsQuery();
  const { withContentTableDefault, attachmentsDefault, itemBodyDefault } = data?.myOptions || {};
  const [setOptions] = useSetFeedOptionsMutation();
  const [errorMsg, setErrorMsg] = useState('');

  const formatDefault = (defaultValue?: boolean | null) => {
    return defaultValue === undefined || defaultValue === null
      ? 'Default'
      : `Default (${defaultValue ? 'Enable' : 'Disable'})`;
  };

  if (!feed) return null;
  const { id, attachments, itemBody, schedule, theme, withContentTable, filter } = feed;
  return (
    <Formik
      initialValues={{ attachments, itemBody, schedule, theme, withContentTable, filter }}
      onSubmit={async (opts) => {
        setOptions({ variables: { id, opts } })
          .then((result) => setErrorMsg(result.data?.setFeedOptions.errors?.[0].message || ''))
          .catch((error) => setErrorMsg(error.message));
      }}
    >
      {({ values, handleChange, handleSubmit, isSubmitting }) => (
        <form className="flex flex-col" method="post" onSubmit={handleSubmit}>
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
                <Link href="/help#filter">
                  <a className="underline ml-1">More info</a>
                </Link>
              </span>
            </div>
            <InputUnderline
              name="filter"
              title="Filter items"
              className="w-full px-2 font-medium"
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

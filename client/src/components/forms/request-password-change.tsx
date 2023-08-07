import { Formik } from 'formik';
import Link from 'next/link';
import React, { useState } from 'react';
import * as Yup from 'yup';

import MailIcon from '@/../public/static/envelope.svg';
import GraphQLError from '@/components/graphql-error';
import { MessageItem } from '@/components/main-card/animated-message';
import { useRequestPasswordResetMutation } from '@/generated/graphql';

import InputWithIcon from './input-with-icon';

// VALIDATION
const RequestResetSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('The field is required'),
});

interface RequestPassProps {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

const RequestPasswordChangeForm = ({ setMessages }: RequestPassProps) => {
  const [requestPassword] = useRequestPasswordResetMutation();
  const [wasSuccess, setWasSuccess] = useState(false);
  return (
    <Formik
      initialValues={{ email: '' }}
      validationSchema={RequestResetSchema}
      onSubmit={async ({ email }, { setSubmitting }) => {
        try {
          const { data } = await requestPassword({ variables: { email } });
          const message = data?.requestPasswordReset.message;
          if (message === 'OK') {
            setMessages?.([{ type: 'success', key: 'success', text: 'Reset link has been sent' }]);
            setWasSuccess(true);
          } else {
            setMessages?.([{ type: 'error', key: 'error', text: message }]);
          }
        } catch (err) {
          setMessages?.([
            {
              key: 'error',
              content: <GraphQLError error={(err as { message: string }).message} />,
            },
          ]);
        }
        setSubmitting(false);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form className="w-full" onSubmit={handleSubmit}>
          <InputWithIcon
            id="email"
            type="email"
            IconSVG={MailIcon}
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.email}
            error={errors.email}
            disabled={isSubmitting || wasSuccess}
            title="Email address"
            required
          />
          <div className="w-full text-right mb-3">
            <Link href="/login" className="text-xs underline">
              ← back to log in form
            </Link>
          </div>
          <button
            type="submit"
            className="submit-btn w-full text-xl tracking-wider"
            disabled={isSubmitting || wasSuccess}
          >
            {isSubmitting ? 'Loading...' : 'Email me'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default RequestPasswordChangeForm;

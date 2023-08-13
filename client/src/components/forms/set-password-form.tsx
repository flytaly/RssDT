import { Formik } from 'formik';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import * as Yup from 'yup';

import PasswordIcon from '@/../public/static/key.svg';
import GraphQLError from '@/components/graphql-error';
import { MessageItem } from '@/components/main-card/animated-message';
import { MeDocument, MeQuery, useResetPasswordMutation } from '@/generated/graphql';

import InputWithIcon from './input-with-icon';

// VALIDATION
const SetPasswordSchema = Yup.object().shape({
  password: Yup.string().min(8).max(100).required('Password is required'),
  confirm: Yup.string()
    // @ts-ignore
    .oneOf([Yup.ref('password'), null], "Passwords don't match")
    .required('Confirm Password is required'),
});

interface SetPasswordProps {
  token: string;
  userId: string;
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

const SetPasswordForm = ({ setMessages, token, userId }: SetPasswordProps) => {
  const [resetPassword] = useResetPasswordMutation();
  const router = useRouter();
  const disabled = !token || !userId;
  return (
    <Formik
      initialValues={{ password: '', confirm: '' }}
      validationSchema={SetPasswordSchema}
      onSubmit={async ({ password }, { setSubmitting }) => {
        try {
          const { data } = await resetPassword({
            variables: { input: { password, token, userId } },
            update: (cache, result) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: { __typename: 'Query', me: result.data?.resetPassword.user },
              });
            },
          });
          if (data?.resetPassword?.user) {
            router.push('/');
          } else {
            setMessages?.([
              { type: 'error', key: 'error', text: data?.resetPassword.errors?.[0].message },
            ]);
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
            id="password"
            type="Password"
            IconSVG={PasswordIcon}
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.password}
            error={errors.password}
            disabled={isSubmitting || disabled}
            required
          />

          <InputWithIcon
            id="confirm"
            type="Password"
            IconSVG={PasswordIcon}
            placeholder="Confirm password"
            value={values.confirm}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.confirm}
            error={errors.confirm}
            disabled={isSubmitting || disabled}
            required
          />
          <button
            type="submit"
            className="submit-btn w-full text-xl tracking-wider"
            disabled={isSubmitting || disabled}
          >
            {isSubmitting ? 'Setting...' : 'Set password'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default SetPasswordForm;

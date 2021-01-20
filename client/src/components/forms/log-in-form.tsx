import { Formik } from 'formik';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import React from 'react';
import * as Yup from 'yup';
import MailIcon from '../../../public/static/envelope.svg';
import PasswordIcon from '../../../public/static/key.svg';
import { MeDocument, MeQuery, useLoginMutation } from '../../generated/graphql';
import GraphQLError from '../graphql-error';
import { MessageItem } from '../welcome-card/animated-message';
import Input from './input';

// VALIDATION
const AddFeedSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('The field is required'),
  password: Yup.string().min(8).max(100).required('The field is required'),
});

interface LoginProps {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

const LoginForm: React.FC<LoginProps> = ({ setMessages }) => {
  const [logIn] = useLoginMutation();
  const router = useRouter();
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={AddFeedSchema}
      onSubmit={async ({ email, password }, { setSubmitting }) => {
        try {
          const { data } = await logIn({
            variables: { email, password },
            update: (cache, result) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: { __typename: 'Query', me: result.data?.login.user },
              });
            },
          });
          if (data?.login?.user) {
            router.push('/feeds/manage');
          } else {
            setMessages?.([{ type: 'error', key: 'error', text: data?.login.errors?.[0].message }]);
          }
        } catch (err) {
          setMessages?.([{ key: 'error', content: <GraphQLError error={err.message} /> }]);
        }
        setSubmitting(false);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form className="w-full" onSubmit={handleSubmit}>
          <Input
            id="email"
            type="email"
            IconSVG={MailIcon}
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.email}
            error={errors.email}
            disabled={isSubmitting}
            title="Email address"
            required
          />

          <Input
            id="password"
            type="Password"
            IconSVG={PasswordIcon}
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.password}
            error={errors.password}
            disabled={isSubmitting}
            required
          />
          <div className="w-full text-right mb-3">
            <Link href="/request-reset">
              <a className="text-xs underline">I forgot or don&apos;t have password</a>
            </Link>
          </div>
          <button
            type="submit"
            className="btn w-full text-xl tracking-wider"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default LoginForm;

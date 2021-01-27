import { Formik } from 'formik';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import * as Yup from 'yup';
import MailIcon from '../../../public/static/envelope.svg';
import PasswordIcon from '../../../public/static/key.svg';
import { MeDocument, MeQuery, useRegisterMutation } from '../../generated/graphql';
import GraphQLError from '../graphql-error';
import { MessageItem } from '../main-card/animated-message';
import InputWithIcon from './input-with-icon';

// VALIDATION
const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('The field is required'),
  password: Yup.string().min(8).max(100).required('The field is required'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords don't match")
    .required('Confirm Password is required'),
});

interface LoginProps {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

const RegisterForm: React.FC<LoginProps> = ({ setMessages }) => {
  const [register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Formik
      initialValues={{ email: '', password: '', confirm: '' }}
      validationSchema={RegisterSchema}
      onSubmit={async ({ email, password }, { setSubmitting }) => {
        try {
          const { data } = await register({
            variables: { email, password },
            update: (cache, result) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: { __typename: 'Query', me: result.data?.register.user },
              });
            },
          });
          if (data?.register?.user) {
            router.push('/feeds/manage');
          } else {
            setMessages?.([
              { type: 'error', key: 'error', text: data?.register.errors?.[0].message },
            ]);
          }
        } catch (err) {
          setMessages?.([{ key: 'error', content: <GraphQLError error={err.message} /> }]);
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
            disabled={isSubmitting}
            title="Email address"
            required
          />

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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            required
          />
          <button
            type="submit"
            className="submit-btn w-full text-xl tracking-wider"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registration...' : 'Register'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default RegisterForm;

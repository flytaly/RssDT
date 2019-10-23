import React from 'react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { SubmitButton } from '../styled/buttons';
import Input from '../forms/input-with-icon';
import StyledForm from './styled-login-form';
import EmailIcon from '../../public/static/envelope.svg';
import PasswordIcon from '../../public/static/key.svg';
import ME_QUERY, { meFields } from '../../queries/me-query';

export const updateMeAfterSignIn = (dataProxy, mutationResult) => {
    try {
        const me = mutationResult.data.signIn;
        dataProxy.writeQuery({ query: ME_QUERY, data: { me } });
    } catch (e) {
        console.error(e);
    }
};

const SIGN_IN_MUTATION = gql`
  mutation SIGN_IN_MUTATION(
    $email: String!
    $password: String!
  ) {
    signIn(
        email: $email
        password: $password
    ) {
        ...meFields
    }
  }
  ${meFields}
`;

// VALIDATION
const LogInSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('The field is required'),
    password: Yup.string()
        .min(8)
        .required('The field is required'),
});

const LogInForm = ({ setMessages }) => {
    const [signIn] = useMutation(SIGN_IN_MUTATION, { update: updateMeAfterSignIn });
    const router = useRouter();

    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LogInSchema}
            onSubmit={async (variables, { setSubmitting/* , resetForm */ }) => {
                const { email, password } = variables;

                try {
                    const { data } = await signIn({ variables: { email, password } });
                    if (data && data.signIn) {
                        router.replace('/feeds');
                    }
                } catch (error) {
                    setMessages({ error: error.message });
                }
                setSubmitting(false);
            }}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
            }) => (
                <StyledForm onSubmit={handleSubmit} data-testid="login">
                    <h2>Log in</h2>
                    <Input
                        id="email"
                        type="email"
                        IconSVG={EmailIcon}
                        touched={touched.email}
                        placeholder="Email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                        error={errors.email}
                        disabled={isSubmitting}
                        title="Email address"
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        IconSVG={PasswordIcon}
                        touched={touched.password}
                        placeholder="Password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        error={errors.password}
                        disabled={isSubmitting}
                        title="Password"
                        required
                    />
                    <Link href="/request-reset"><a>I forgot or don&apos;t have password</a></Link>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Log in'}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

LogInForm.propTypes = {
    setMessages: PropTypes.func.isRequired,
};

export default LogInForm;

export { SIGN_IN_MUTATION };

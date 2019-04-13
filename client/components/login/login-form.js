import React from 'react';
import { Formik } from 'formik';
import { withRouter } from 'next/router';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import SubmitButton from '../styled/submit-button';
import Input from '../forms/input-with-icon';
import StyledForm from './styled-login-form';

const SIGN_IN_MUTATION = gql`
  mutation SIGN_IN_MUTATION(
    $email: String!
    $password: String!
  ) {
    signIn(
        email: $email
        password: $password
    ) {
        message
    }
  }
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

const LogInForm = ({ setMessages, router, changeForm }) => {
    const signIn = useMutation(SIGN_IN_MUTATION);
    const handleClick = (e) => {
        e.preventDefault();
        changeForm();
    };
    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LogInSchema}
            onSubmit={async (variables, { setSubmitting }) => {
                const { email, password } = variables;

                try {
                    const { data } = await signIn({ variables: { email, password } });
                    if (data && data.signIn && data.signIn.message) {
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
                        name="email"
                        icon="./static/envelope.svg"
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
                        name="password"
                        icon="./static/key.svg"
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
                    <a onClick={handleClick} href="/login">I forgot or don&apos;t have password</a>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Log in'}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

LogInForm.propTypes = {
    setMessages: PropTypes.func.isRequired,
    router: PropTypes.shape({ replace: PropTypes.func.isRequired }).isRequired,
    changeForm: PropTypes.func.isRequired,
};

export default withRouter(LogInForm);

export { SIGN_IN_MUTATION };

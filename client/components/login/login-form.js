import React from 'react';
import { Formik } from 'formik';
import Router from 'next/router';
import styled from 'styled-components';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import SubmitButton from '../styled/submit-button';
import Input from '../forms/input-with-icon';

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

// STYLED COMPONENTS
const StyledForm = styled.form.attrs({
    method: 'POST',
})`
    align-self: center;
    display: flex;
    flex-direction: column;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
`;

const Title = styled.h2`
    align-self: center;
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
    const signIn = useMutation(SIGN_IN_MUTATION);
    return (
        <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LogInSchema}
            onSubmit={async (variables, { setSubmitting }) => {
                const { email, password } = variables;

                try {
                    const { data } = await signIn({ variables: { email, password } });
                    if (data && data.signIn && data.signIn.message) {
                        Router.replace('/subscriptions');
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
                <StyledForm onSubmit={handleSubmit}>
                    <Title>Log in</Title>
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

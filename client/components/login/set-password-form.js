import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import Router from 'next/router';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import SubmitButton from '../styled/submit-button';
import Input from '../forms/input-with-icon';
import StyledForm from './styled-login-form';

const SET_PASSWORD_MUTATION = gql`
  mutation SET_PASSWORD_MUTATION(
    $password: String!
    $token: String!
  ) {
    setPassword(
        password: $password
        token: $token
    ) {
        email
    }
  }
`;


// VALIDATION
const SetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    confirm: Yup.string()
        .oneOf([Yup.ref('password'), null], "Passwords don't match")
        .required('Confirm Password is required'),
});

const SetPasswordForm = ({ setMessages, token }) => {
    const [passwordSaved, setPasswordSaved] = useState(false);
    const setPassword = useMutation(SET_PASSWORD_MUTATION);
    return (
        <Formik
            initialValues={{ password: '', confirm: '' }}
            validationSchema={SetPasswordSchema}
            onSubmit={async (variables, { setSubmitting }) => {
                const { password } = variables;

                try {
                    const { data } = await setPassword({ variables: { password, token } });

                    if (data && data.setPassword) {
                        setMessages({ success: 'New password was saved' });
                        setPasswordSaved(true);
                        setTimeout(() => Router.replace('/login'), 500);
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
                <StyledForm onSubmit={handleSubmit} data-testid="set_password">
                    <h2>Enter new password</h2>
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
                    <Input
                        id="confirm"
                        type="password"
                        name="confirm"
                        icon="./static/key.svg"
                        touched={touched.confirm}
                        placeholder="Confirm password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.confirm}
                        error={errors.confirm}
                        disabled={isSubmitting}
                        title="Confirm password"
                        required
                    />
                    <SubmitButton type="submit" disabled={isSubmitting || passwordSaved}>
                        {isSubmitting ? 'Setting password...' : 'Set password'}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

SetPasswordForm.propTypes = {
    setMessages: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
};

export default SetPasswordForm;

export { SET_PASSWORD_MUTATION };

import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { SubmitButton } from '../styled/buttons';
import Input from '../forms/input-with-icon';
import StyledForm from './styled-login-form';
import emailIcon from '../../static/envelope.svg';

const REQUEST_PASSWORD_CHANGE = gql`
  mutation REQUEST_PASSWORD_CHANGE(
    $email: String!
  ) {
    requestPasswordChange(
        email: $email
    ) {
        message
    }
  }
`;


// VALIDATION
const RequestPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('The field is required'),
});

const getButtonText = (emailSent, isSubmitting) => {
    if (emailSent) return '✔';
    if (isSubmitting) return 'Sending...';
    return 'Email me';
};

const RequestPasswordForm = ({ setMessages, changeForm }) => {
    const [emailSent, setEmailSent] = useState(false);
    const requestPassword = useMutation(REQUEST_PASSWORD_CHANGE);
    const handleClick = (e) => {
        e.preventDefault();
        changeForm();
    };
    return (
        <Formik
            initialValues={{ email: '' }}
            validationSchema={RequestPasswordSchema}
            onSubmit={async (variables, { setSubmitting }) => {
                const { email } = variables;

                try {
                    const { data } = await requestPassword({ variables: { email } });
                    if (data && data.requestPasswordChange && data.requestPasswordChange.message) {
                        setMessages({ success: 'If provided email is correct reset link has been sent' });
                        setEmailSent(true);
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
                <StyledForm onSubmit={handleSubmit} data-testid="request_password">
                    <h2>Reset password</h2>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        icon={emailIcon}
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
                    <a onClick={handleClick} href="/login">← back to log in form</a>
                    <SubmitButton type="submit" disabled={isSubmitting || emailSent}>
                        {getButtonText(emailSent, isSubmitting)}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

RequestPasswordForm.propTypes = {
    setMessages: PropTypes.func.isRequired,
    changeForm: PropTypes.func.isRequired,
};

export default RequestPasswordForm;

export { REQUEST_PASSWORD_CHANGE };

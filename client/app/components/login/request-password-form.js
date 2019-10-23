import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { SubmitButton } from '../styled/buttons';
import Input from '../forms/input-with-icon';
import StyledForm from './styled-login-form';
import EmailIcon from '../../public/static/envelope.svg';

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

const RequestPasswordForm = ({ setMessages }) => {
    const [emailSent, setEmailSent] = useState(false);
    const [requestPassword] = useMutation(REQUEST_PASSWORD_CHANGE);
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
                    <Link href="/login"><a>← back to log in form</a></Link>
                    <SubmitButton type="submit" disabled={isSubmitting || emailSent}>
                        {getButtonText(emailSent, isSubmitting)}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

RequestPasswordForm.propTypes = {
    setMessages: PropTypes.func.isRequired,
};

export default RequestPasswordForm;

export { REQUEST_PASSWORD_CHANGE };

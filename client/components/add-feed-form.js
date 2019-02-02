import React from 'react';
import { Formik } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import SubmitButton from './styled/submit-button';
import Input from './input-with-icon';
import Select from './select-with-icon';

const ADD_FEED_MUTATION = gql`
  mutation ADD_FEED_MUTATION(
    $email: String!
    $url: String!
    $schedule: DigestSchedule
  ) {
    addFeed(
        email: $email
        feedUrl: $url
        feedSchedule: $schedule
    ) {
        message
    }
  }
`;

// STYLED COMPONENTS
const StyledForm = styled.form`
    align-self: center;
    display: flex;
    flex-direction: column;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
`;

const FeedTitle = styled.h2`
    align-self: center;
`;

// VALIDATION
const AddFeedSchema = Yup.object().shape({
    url: Yup.string()
        .url('Invalid feed address'),
    // .required('Required'),
    email: Yup.string()
        .email('Invalid email address'),
    // .required('Required'),
});

const AddFeedForm = ({ setMessages }) => {
    const addFeed = useMutation(ADD_FEED_MUTATION);
    return (
        <Formik
            initialValues={{ email: '', url: 'http://', period: '24' }}
            validationSchema={AddFeedSchema}
            onSubmit={async (variables, { setSubmitting, resetForm }) => {
                const { email, url, period } = variables;
                try {
                    const { data } = await addFeed({ variables: { email, url, period } });
                    setMessages({ success: data.addFeed.message });
                    resetForm();
                } catch (error) {
                    setMessages({ error: error.message });
                }
                setSubmitting(false);
            }}
        >
            {({
                values, errors,
                // touched,
                handleChange,
                // handleBlur,
                handleSubmit, isSubmitting,
            }) => (
                <StyledForm onSubmit={handleSubmit}>
                    <FeedTitle>Add feed</FeedTitle>
                    <Input
                        type="url"
                        name="url"
                        placeholder="http://..."
                        onChange={handleChange}
                        value={values.url}
                        error={errors.url}
                        disabled={isSubmitting}
                        required
                    />
                    <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        value={values.email}
                        error={errors.email}
                        disabled={isSubmitting}
                        required
                    />
                    <Select name="period" defaultValue="24" disabled={isSubmitting}>
                        <option value="1">Every hour</option>
                        <option value="2">Every 2 hours</option>
                        <option value="3">Every 3 hours</option>
                        <option value="6">Every 6 hours</option>
                        <option value="12">Every 12 hours</option>
                        <option value="24">Daily</option>
                    </Select>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'SUBMITTING...' : 'SUBSCRIBE'}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

AddFeedForm.propTypes = {
    setMessages: PropTypes.func.isRequired,
};

export default AddFeedForm;

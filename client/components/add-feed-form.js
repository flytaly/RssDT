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
import periods from '../types/digest-periods';

const ADD_FEED_MUTATION = gql`
  mutation ADD_FEED_MUTATION(
    $email: String!
    $url: String!
    $period: DigestSchedule
  ) {
    addFeed(
        email: $email
        feedUrl: $url
        feedSchedule: $period
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
            initialValues={{ email: '', url: 'http://', period: periods.DAILY }}
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
                        id="url"
                        type="url"
                        name="url"
                        placeholder="http://..."
                        onChange={handleChange}
                        value={values.url}
                        error={errors.url}
                        disabled={isSubmitting}
                        title="The RSS or Atom feed url"
                        required
                    />
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        value={values.email}
                        error={errors.email}
                        disabled={isSubmitting}
                        title="Email address"
                        required
                    />
                    <Select
                        id="period"
                        name="period"
                        defaultValue={periods.DAILY}
                        disabled={isSubmitting}
                        onChange={handleChange}
                        title="Send a digest for the period"
                    >
                        <option value={periods.EVERYHOUR}>Every hour</option>
                        <option value={periods.EVERY2HOURS}>Every 2 hours</option>
                        <option value={periods.EVERY3HOURS}>Every 3 hours</option>
                        <option value={periods.EVERY6HOURS}>Every 6 hours</option>
                        <option value={periods.EVERY12HOURS}>Every 12 hours</option>
                        <option value={periods.DAILY}>Daily</option>
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
export { ADD_FEED_MUTATION };

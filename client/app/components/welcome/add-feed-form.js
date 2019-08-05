import React from 'react';
import { Formik } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { SubmitButton } from '../styled/buttons';
import Input from '../forms/input-with-icon';
import Select from '../forms/select-with-icon';
import periods, { periodNames } from '../../types/digest-periods';
import RssIcon from '../../static/rss-square.svg';
import EmailIcon from '../../static/envelope.svg';
import ClockIcon from '../../static/clock.svg';

const ADD_FEED_MUTATION = gql`
  mutation ADD_FEED_MUTATION(
    $email: String!
    $url: String!
    $period: DigestSchedule
    $locale: String
    $timeZone: String
  ) {
    addFeed(
        email: $email
        feedUrl: $url
        feedSchedule: $period
        locale: $locale
        timeZone: $timeZone
    ) {
        message
    }
  }
`;

// STYLED COMPONENTS
const StyledForm = styled.form`
    align-self: center;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
`;

const FeedTitle = styled.h2`
    align-self: center;
`;

// VALIDATION
const AddFeedSchema = Yup.object().shape({
    url: Yup.string()
        .url('Invalid feed address')
        .required('The field is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('The field is required'),
});

const AddFeedForm = ({ setMessages, user }) => {
    const addFeed = useMutation(ADD_FEED_MUTATION);
    return (
        <Formik
            initialValues={{ email: user.email, url: 'http://', period: periods.DAILY }}
            validationSchema={AddFeedSchema}
            onSubmit={async (formVariables, { setSubmitting, resetForm }) => {
                const { email, url, period } = formVariables;
                try {
                    const variables = { email, url, period };

                    if (Intl && Intl.DateTimeFormat) {
                        const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
                        variables.timeZone = timeZone;
                        variables.locale = locale;
                    }
                    const { data } = await addFeed({ variables });
                    setMessages({ success: data.addFeed.message });
                    resetForm();
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
                    <FeedTitle>Add a feed</FeedTitle>
                    <Input
                        id="url"
                        type="url"
                        IconSVG={RssIcon}
                        touched={touched.url}
                        placeholder="http://..."
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.url}
                        error={errors.url}
                        disabled={isSubmitting}
                        title="The RSS or Atom feed url"
                        required
                    />
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
                        disabled={isSubmitting || user.email}
                        title="Email address"
                        required
                    />
                    <Select
                        id="period"
                        IconSVG={ClockIcon}
                        defaultValue={periods.DAILY}
                        disabled={isSubmitting}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        title="Select a digest period"
                    >
                        <option value={periods.EVERYHOUR}>{`${periodNames[periods.EVERYHOUR]} digest`}</option>
                        <option value={periods.EVERY2HOURS}>{`${periodNames[periods.EVERY2HOURS]} digest`}</option>
                        <option value={periods.EVERY3HOURS}>{`${periodNames[periods.EVERY3HOURS]} digest`}</option>
                        <option value={periods.EVERY6HOURS}>{`${periodNames[periods.EVERY6HOURS]} digest`}</option>
                        <option value={periods.EVERY12HOURS}>{`${periodNames[periods.EVERY12HOURS]} digest`}</option>
                        <option value={periods.DAILY}>{`${periodNames[periods.DAILY]} digest`}</option>
                    </Select>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'SUBMITTING...' : 'SUBSCRIBE'}
                    </SubmitButton>
                </StyledForm>)}
        </Formik>);
};

AddFeedForm.propTypes = {
    user: PropTypes.shape({ email: PropTypes.string }),
    setMessages: PropTypes.func.isRequired,
};
AddFeedForm.defaultProps = {
    user: { email: '' },
};

export default AddFeedForm;
export { ADD_FEED_MUTATION };

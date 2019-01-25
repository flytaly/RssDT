import React from 'react';
import { Formik } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import SubmitButton from './styled/submit-button';
import Input from './input-with-icon';
import Select from './select-with-icon';

const Form = styled.form`
    align-self: center;
    display: flex;
    flex-direction: column;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
`;

const FeedTitle = styled.h2`
    align-self: center;
`;

const AddFeedSchema = Yup.object().shape({
    url: Yup.string()
        .url('Invalid feed address'),
    // .required('Required'),
    email: Yup.string()
        .email('Invalid email address'),
    // .required('Required'),
});

const AddFeedForm = () => (
    <Formik
        initialValues={{ email: '', url: 'http://', period: '24' }}
        validationSchema={AddFeedSchema}
        onSubmit={(values) => {
            console.log(values);
        }}
    >
        {({
            values,
            errors,
            // touched,
            handleChange,
            // handleBlur,
            handleSubmit,
            isSubmitting,
        }) => (
            <Form onSubmit={handleSubmit}>
                <FeedTitle>Add feed</FeedTitle>
                <Input
                    type="url"
                    name="url"
                    placeholder="http://..."
                    onChange={handleChange}
                    value={values.url}
                    error={errors.url}
                    required
                />
                <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    value={values.email}
                    error={errors.email}
                    required
                />
                <Select name="period" defaultValue="24">
                    <option value="1">Every hour</option>
                    <option value="2">Every 2 hours</option>
                    <option value="3">Every 3 hours</option>
                    <option value="6">Every 6 hours</option>
                    <option value="12">Every 12 hours</option>
                    <option value="24">Daily</option>
                </Select>
                <SubmitButton
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBSCRIBE'}
                </SubmitButton>
            </Form>)
        }
    </Formik>);

export default AddFeedForm;

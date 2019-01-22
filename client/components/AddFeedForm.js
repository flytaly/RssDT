import React from 'react';
import { Formik } from 'formik';
import styled, { withTheme } from 'styled-components';
import SubmitButton from './styled/SubmitButton';
import Input from './InputWithIcon';
import Select from './SelectWithIcon';

const Form = styled.form`
    align-self: center;
    display: flex;
    flex-direction: column;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
`;

const FeedTitle = styled.h2`
    align-self: center;
`;

const AddFeedForm = () => (
    <Formik
        initialValues={{ email: '', url: '', period: '24' }}
        validate={(values) => {
            console.log(values);
        }}
        onSubmit={(values) => {
            console.log(values);
        }}
    >
        {({
            values,
            // errors,
            touched,
            handleChange,
            // handleBlur,
            handleSubmit,
            isSubmitting,
        }) => (
            <Form onSubmit={handleSubmit}>
                <FeedTitle>Add feed</FeedTitle>
                <Input
                    touched={touched}
                    type="url"
                    name="url"
                    placeholder="http://..."
                    onChange={handleChange}
                    value={values.url}
                />
                <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    value={values.email}
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
                    SUBSCRIBE
                </SubmitButton>
            </Form>)
        }
    </Formik>);

export default withTheme(AddFeedForm);

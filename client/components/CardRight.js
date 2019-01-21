import React from 'react';
import styled, { withTheme } from 'styled-components';
import { Formik } from 'formik';
import CardHalf from './styled/CardHalf';
import SubmitButton from './styled/SubmitButton';

const StyledHalf = styled(CardHalf)`
    background: ${props => props.theme.greyLight};
    border: 1px solid ${props => props.theme.greyDark};
    border-radius: 10px;
`;

const Login = styled.a`
    font-size: 1.3rem;
    align-self: flex-end;
`;

const FeedTitle = styled.h2`
    align-self: center;
`;

const AddFeedForm = styled.form`
    align-self: center;
    display: flex;
    flex-direction: column;
    width: ${props => props.theme.cardWidth / 2 - 6}rem;
`;


const WelcomeLeft = () => (
    <StyledHalf>
        <Login href="#">Login</Login>
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
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
            }) => (
                <AddFeedForm onSubmit={handleSubmit}>
                    <FeedTitle>Add feed</FeedTitle>
                    <input
                        type="url"
                        name="url"
                        placeholder="http://..."
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.url}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                    />
                    <select name="period" defaultValue="24">
                        <option value="1">Every hour</option>
                        <option value="2">Every 2 hours</option>
                        <option value="3">Every 3 hours</option>
                        <option value="6">Every 6 hours</option>
                        <option value="12">Every 12 hours</option>
                        <option value="24">Daily</option>
                    </select>
                    <SubmitButton
                        type="submit"
                        disabled={isSubmitting}
                    >
                        SUBSCRIBE
                    </SubmitButton>
                </AddFeedForm>)
            }
        </Formik>

    </StyledHalf>
);

export default withTheme(WelcomeLeft);

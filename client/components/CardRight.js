import React from 'react';
import styled from 'styled-components';
import CardHalf from './CardHalf';

const StyledCard = styled(CardHalf)`
    background: #f5f5f5;
    border: 1px solid #707070;
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
`;

const SubmitButton = styled.button`
    width: 28rem;
    height: 4.5rem;
    max-width: 100%;
    padding-left: 2rem;
    padding-right: 1rem;
    margin-top: 1rem;
    background-color: #AC247D;
    color: #FFFFFF;
    border: 1px solid #E6E6E6;
    border-radius: 30px;
    font-size: 2rem;
`;

const WelcomeLeft = () => (
    <StyledCard>
        <Login href="#">Login</Login>
        <AddFeedForm>
            <FeedTitle>Add feed</FeedTitle>
            <input placeholder="http://..." />
            <input placeholder="Email" />
            <input placeholder="Daily" />
            <SubmitButton type="submit">SUBSCRIBE</SubmitButton>
        </AddFeedForm>
    </StyledCard>
);

export default WelcomeLeft;

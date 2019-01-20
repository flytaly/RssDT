import React from 'react';
import styled from 'styled-components';
import CardLeft from './CardLeft';
import CardRight from './CardRight';

const StyledCard = styled.div`
    display: flex;
    flex-wrap: wrap;
    background-color: white;
    width: 72rem;
    min-width: 36rem;
    max-width: calc(100vw - 2rem);
    margin: 2rem auto;
    border-radius: 10px;
`;

const WelcomeCard = () => (
    <StyledCard>
        <CardLeft />
        <CardRight />
    </StyledCard>
);

export default WelcomeCard;

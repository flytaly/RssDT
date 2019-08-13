import React from 'react';
import StyledCard from '../components/styled/card';
import Container from '../components/styled/card-inner-container';
import Help from '../components/help';
import CardHeader from '../components/card-header';

const HelpPage = () => (
    <StyledCard>
        <Container>
            <CardHeader />
            <Help />
        </Container>
    </StyledCard>
);

export default HelpPage;

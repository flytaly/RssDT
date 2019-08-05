import React from 'react';
import styled from 'styled-components';
import logoBlackIcon from '../static/icon-black.png';

const LogoContainer = styled.div`
    display: inline-flex;
    align-items: center;
    border-radius: 10px;
    background-color: rgba(255,255,255, 0.66);
    padding: 0.2rem 1rem;
`;

const Icon = styled.img`
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 1rem;
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 1.8rem;
    margin-right: 1rem;
    a {
        color: inherit;
        text-decoration: none;
    }
`;
const Description = styled.span`
    color: dimgray;
    font-size: 1.2rem;
`;

const Logo = () => (
    <LogoContainer>
        <Icon src={logoBlackIcon} />
        <div>
            <Title><a href="/">FeedMailu</a></Title>
            <Description>feed to email aggregator</Description>
        </div>

    </LogoContainer>);

export default Logo;

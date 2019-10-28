import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import logoBlackIcon from '../public/static/icon-black.png';

const LinkWithLogo = styled.a`
        display: inline-flex;
        align-items: center;
        border-radius: 10px;
        background-color: rgba(255,255,255, 0.66);
        padding: 0.2rem 1rem;
        color: inherit;
        text-decoration: none;
        h1 {
            margin: 0;
            padding: 0;
            font-weight: inherit;
            font-size: inherit;
        }
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
`;
const Description = styled.span`
    color: dimgray;
    font-size: 1.2rem;
`;

const Logo = () => (
    <Link href="/">
        <LinkWithLogo href="/">
            <Icon src={logoBlackIcon} alt="Logo" />
            <h1>
                <Title>FeedMailu</Title>
                <Description>feed to email aggregator</Description>
            </h1>
        </LinkWithLogo>
    </Link>
);

export default Logo;

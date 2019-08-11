import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const StyledFooter = styled.footer`
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
`;

const FooterRow = styled.div`
    display: inline-block;
    font-size: 1.3rem;
    color: ${({ theme }) => theme.footerFontColor};
    text-align: center;
    margin-top: 0.5rem;
    > span {
        margin-right: 0.5rem;
        vertical-align: middle;
    }
    svg {
        vertical-align: middle;
    }
    a:active,
    a:visited,
    a:link,
    a {
        text-decoration: none;
        color: inherit;
    }
    a:hover {
        color: ${({ theme }) => theme.footerHoverLinkColor};
    }
`;

const Footer = () => {
    const currentYear = (new Date()).getFullYear();
    return (
        <StyledFooter>
            <FooterRow>
                <span><Link href="/help"><a>Help</a></Link></span>
                <span><a href="mailto:support@feedmailu.com">Contact</a></span>
            </FooterRow>
            <FooterRow>
                <span>{currentYear}</span>
                <span>
                    <a href="https://github.com/flytaly/">
                        <span>Vitaly Yerofeyevsky</span>
                    </a>
                </span>
            </FooterRow>
        </StyledFooter>
    );
};

export default Footer;

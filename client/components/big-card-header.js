import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Link from 'next/link';

const Header = styled.header`
  display: flex;
  flex-direction:column;
  width: 100%;
  font-size: 1.4rem;
  font-family: Helvetica, Roboto, sans-serif;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
  > *:not(:first-child) {
    margin-left: 1rem;
  }
  a {
    position: relative;
    color: ${props => props.theme.fontColor};
    text-decoration: none;
  }
  a:active {
    color: ${props => props.theme.accentColor1};
  }
  a:after {
    content: '';
    width: 0px;
  }
  a.active:after,
  a:hover:after{
    position: absolute;
    height: 2px;
    width: 100%;
    right: 0;
    left: 0;
    bottom: -3px;
    margin: 0 auto;
    background-color:${props => props.theme.accentColor1};
    transition: all .20s;
  }
  a:not(:hover).active:after{
    height: 1px;
    background-color:${props => props.theme.fontColor};
  }
`;

const Title = styled.h2`
  flex-grow: 1;
  font-size: 2.0rem;
  color:  ${props => props.theme.accentColor1};
  font-weight: bolder;
  margin: 0;
`;

const getSubRow = (page) => {
    if (page === 'manage' || page === 'view') {
        return (
            <HeaderRow>
                <Link href="/feeds/view">
                    <a href="/feeds/view" className={page === 'view' ? 'active' : null}>View</a>
                </Link>
                <Link href="/feeds/manage">
                    <a href="/feeds/manage" className={page === 'manage' ? 'active' : null}>Manage</a>
                </Link>
            </HeaderRow>);
    }

    return <HeaderRow />;
};

const BigCardHeader = ({ page }) => {
    const getTitle = () => {
        if (page === 'settings') return 'Settings';
        return 'Subscriptions';
    };

    return (
        <Header>
            <HeaderRow>
                <Title>{getTitle()}</Title>
                {page !== 'manage' && page !== 'view' && <Link href="/feeds"><a href="/feeds">Feeds</a></Link>}
                {page !== 'settings' && <Link href="/settings"><a href="/settings">Settings</a></Link>}
                {<Link href="/logout"><a href="/logout">Log out</a></Link>}
            </HeaderRow>
            {getSubRow(page)}
        </Header>);
};

BigCardHeader.propTypes = {
    page: PropTypes.string.isRequired,
};

export default BigCardHeader;

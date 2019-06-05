import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button';
import { withRouter } from 'next/router';
import { removeButtonStylesMixin } from './styled/buttons';
import UserCircleIcon from '../static/user-circle-solid.svg';
import { SettingsTitles } from './settings';

const Header = styled.header`
  display: flex;
  flex-direction:column;
  width: 100%;
  font-size: 1.4rem;
  font-family: Helvetica, Roboto, sans-serif;
  padding: 1rem 2rem 0.5rem 2rem;
  margin-right: 1rem;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
  > *:not(:first-child) {
    margin-left: 1.3rem;
  }
  & a {
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

const MenuButtonModified = styled(MenuButton)`
   ${removeButtonStylesMixin}
   &[aria-expanded=true] {
    transform: scale(1.10);
   }
`;

const MenuListModified = styled(MenuList)`
  background: ${props => props.theme.dropDownBgColor};
  color: ${props => props.theme.dropDownFontColor};
  font-size: 1.3rem;
  > [data-reach-menu-item][data-selected] {
    background: ${props => props.theme.dropDownHoverBgColor};
    color: ${props => props.theme.dropDownHoverFontColor};

  }
`;

const Icon = styled.img`
  height: 2rem;
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
    if (page === 'settings') {
        return (
            <HeaderRow>
                {SettingsTitles.map(({ id, name }) => <a key={id} href={`/settings#${id}`}>{name}</a>) }
            </HeaderRow>
        );
    }

    return <HeaderRow />;
};

const BigCardHeader = ({ page, router }) => {
    const getTitle = () => {
        if (page === 'settings') return 'Settings';
        return 'Subscriptions';
    };

    return (
        <Header>
            <HeaderRow>
                <Title>{getTitle()}</Title>
                {page !== 'manage' && page !== 'view' && <Link href="/feeds"><a href="/feeds">Feeds</a></Link>}
                <Menu>
                    <MenuButtonModified><Icon src={UserCircleIcon} alt="Profile" /></MenuButtonModified>
                    <MenuListModified>
                        <MenuItem onSelect={() => { router.push('/settings'); }}>Settings</MenuItem>
                        <MenuItem onSelect={() => { router.push('/logout'); }}>Log out</MenuItem>
                    </MenuListModified>
                </Menu>
            </HeaderRow>
            {getSubRow(page)}
        </Header>);
};

BigCardHeader.propTypes = {
    page: PropTypes.string.isRequired,
    router: PropTypes.shape({ push: PropTypes.func }),
};

BigCardHeader.defaultProps = {
    router: () => {},
};

export default withRouter(BigCardHeader);

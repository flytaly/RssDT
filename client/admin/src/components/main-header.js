import React from 'react';
import { Layout, Icon } from 'antd';
import PropTypes from 'prop-types';

const { Header } = Layout;

const MainHeader = ({ icon, title }) => (
    <Header style={{ background: '#fff', margin: '0 16px' }}>
        <h1>
            {icon ? <Icon type={icon} /> : null}
            <span style={{ marginLeft: 12 }}>{title}</span>
        </h1>
    </Header>
);

MainHeader.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
};

MainHeader.defaultProps = {
    icon: '',
    title: '',
};

export default MainHeader;

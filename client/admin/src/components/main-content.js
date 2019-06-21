import React from 'react';
import { Layout } from 'antd';
import PropTypes from 'prop-types';

const { Content } = Layout;

const MainContent = ({ children }) => (
    <Content style={{ margin: '24px 16px 0' }}>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
        </div>
    </Content>
);

MainContent.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainContent;

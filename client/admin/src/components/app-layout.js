import React from 'react';
import { Router, Link, Match } from '@reach/router';
import { Layout, Menu, Icon } from 'antd';
import 'antd/dist/antd.css';
import Dashboard from './dashboard';
import Users from './users';
import Feeds from './feeds';

const { Footer, Sider } = Layout;

const basepath = 'admin';
const paths = {
    dashboard: `/${basepath}/`,
    users: `/${basepath}/users`,
    feeds: `/${basepath}/feeds`,
};

const getRelativePath = (pathname) => {
    const match = pathname.match(/\/admin\/(?<path>[^/]*)/);
    if (!match || !match.groups.path) return 'dashboard';
    return match.groups.path;
};

const AppLayout = ({ needAuth, isLoading }) => (
    <Layout style={{ minHeight: '100vh' }}>
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
        >
            <div className="logo" />
            <Match path="/hot/:item">
                {({ location }) => (
                    <Menu theme="dark" mode="inline" selectedKeys={[getRelativePath(location.pathname)]}>
                        <Menu.Item key="dashboard">
                            <Link to={paths.dashboard}>
                                <Icon type="dashboard" />
                                <span className="nav-text">Dashboard</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="users">
                            <Link to={paths.users}>
                                <Icon type="user" />
                                <span className="nav-text">Users</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="feeds">
                            <Link to={paths.feeds}>
                                <span className="nav-text">Feeds</span>
                            </Link>
                        </Menu.Item>
                    </Menu>
                )}
            </Match>

        </Sider>
        <Layout>
            <Router basepath={basepath}>
                <Dashboard path="/" />
                <Users path="/users" />
                <Feeds path="/feeds" />
            </Router>
            <Footer style={{ textAlign: 'center' }}>2019</Footer>
        </Layout>
    </Layout>);

export default AppLayout;

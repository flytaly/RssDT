import React from 'react';
import MainHeader from './main-header';
import MainContent from './main-content';

const Dashboard = () => (
    <>
        <MainHeader icon="user" title="Users" />
        <MainContent>
                Users content
        </MainContent>
    </>);

export default Dashboard;

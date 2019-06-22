import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Table, Tag } from 'antd';
import get from 'lodash.get';
import styled from 'styled-components';
import MainHeader from './main-header';
import MainContent from './main-content';
import USERS_QUERY from '../queries/users-query';

const StyledIdCell = styled.div`
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            :hover {
                max-width: auto;
                overflow: visible;
            }
`;

const { Column } = Table;

const Users = () => {
    const { data, loading, error } = useQuery(USERS_QUERY);
    if (error) console.log(error);
    const users = (get(data, 'users', [])).map(user => ({ ...user, key: user.id, feedsNumber: user.feeds.length }));
    return (
        <>
            <MainHeader icon="user" title="Users" />
            <MainContent>
                <Table dataSource={users} scroll={{ x: true }} loading={loading}>
                    <Column title="Email" dataIndex="email" key="email" />
                    <Column
                        title="Permissions"
                        dataIndex="permissions"
                        key="permissions"
                        render={p => <span>{p.map(tag => <Tag key={tag}>{tag}</Tag>)}</span>}
                    />
                    <Column title="Digest Hour" dataIndex="dailyDigestHour" key="dailyDigestHour" />
                    <Column title="Feeds" dataIndex="feedsNumber" key="feedsNumber" />
                    <Column title="TimeZone" dataIndex="timeZone" key="timeZone" />
                    <Column
                        title="CreatedAt"
                        dataIndex="createdAt"
                        key="createdAt"
                        render={d => <span>{new Date(d).toLocaleString()}</span>}
                    />
                    <Column
                        title="ID"
                        dataIndex="id"
                        key="id"
                        render={id => <StyledIdCell title={id}>{id}</StyledIdCell>}
                    />
                </Table>
            </MainContent>
        </>);
};

export default Users;

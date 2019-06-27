import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Table, Icon } from 'antd';
import get from 'lodash.get';
import MainHeader from './main-header';
import MainContent from './main-content';
import FEEDS_QUERY from '../queries/feeds-query';
import JsonViewModal from './json-view-modal';

const { Column } = Table;

const renderCheckIcon = check => <span>{check ? <Icon type="check" /> : <Icon type="minus" />}</span>;

// eslint-disable-next-line react/prop-types
const expandedRowRender = ({ userFeeds }) => {
    const columns = [
        { title: 'User', dataIndex: 'userEmail', key: 'userEmail' },
        { title: 'Schedule', dataIndex: 'schedule', key: 'schedule' },
        { title: 'Activated', dataIndex: 'activated', key: 'activated', render: renderCheckIcon },
    ];
    const data = userFeeds.map(f => ({ ...f, key: f.id, userEmail: f.user.email }));
    return <Table columns={columns} dataSource={data} pagination={false} />;
};

const Feeds = () => {
    const { data, error, loading } = useQuery(FEEDS_QUERY);
    const [viewRowData, setViewRowData] = useState({ isOpen: false, record: {} });
    if (error) { console.error(error); }
    const feeds = (get(data, 'feeds', [])).map(feed => ({ ...feed, key: feed.id }));
    return (
        <>
            <MainHeader title="Feeds" />
            <MainContent>
                <Table
                    dataSource={feeds}
                    scroll={{ x: true }}
                    loading={loading}
                    size="middle"
                    onRow={record => ({ onClick: () => setViewRowData({ isOpen: true, record }) })}
                    expandedRowRender={expandedRowRender}
                >
                    <Column
                        title="Title"
                        dataIndex="title"
                        key="title"
                    />
                    <Column
                        title="items"
                        dataIndex="itemsCount"
                        key="itemsCount"
                        sorter={({ itemsCount: a }, { itemsCount: b }) => a - b}
                    />
                    <Column
                        title="userFeeds"
                        dataIndex="userFeeds"
                        key="userFeeds"
                        sorter={({ userFeeds: a }, { userFeeds: b }) => a.length - b.length}
                        render={(f = []) => <span>{f.length}</span>}
                    />
                    <Column
                        title="Activated"
                        dataIndex="activated"
                        key="activated"
                        render={renderCheckIcon}
                        filters={[{ text: 'yes', value: true }, { text: 'no', value: false }]}
                        onFilter={(value, { activated }) => (value && activated) || (!value && !activated)}
                    />
                    <Column
                        title="Created"
                        dataIndex="createdAt"
                        key="createdAt"
                        sorter={({ createdAt: a }, { createdAt: b }) => Date.parse(a) - Date.parse(b)}
                        defaultSortOrder="descend"
                        render={d => <span>{(new Date(d)).toLocaleString()}</span>}
                    />
                    <Column
                        title="lastSuccessful"
                        dataIndex="lastSuccessful"
                        key="lastSuccessful"
                        sorter={({ lastSuccessful: a }, { lastSuccessful: b }) => Date.parse(a) - Date.parse(b)}
                        render={d => <span>{d ? (new Date(d)).toLocaleString() : null}</span>}
                    />
                </Table>
                <JsonViewModal
                    isOpen={viewRowData.isOpen}
                    jsonData={viewRowData.record}
                    closeModal={() => setViewRowData({ isOpen: false })}
                />
            </MainContent>
        </>
    );
};

export default Feeds;

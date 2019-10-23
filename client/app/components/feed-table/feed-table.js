/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo-hooks';
import Link from 'next/link';
import get from 'lodash.get';
import ReactModal from 'react-modal';
import { Table, Th, Tr, Td, ButtonWithIcon } from './styled-table-parts';
import { DeleteButton, CancelButton } from '../styled/buttons';
import TrashIcon from '../../public/static/trash.svg';
import EditIcon from '../../public/static/edit.svg';
import EditFeedSidebar from './edit-feed-sidebar';
import { periodNames } from '../../types/digest-periods';
import { MY_FEEDS_QUERY, ME_QUERY } from '../../queries';
import RenderInBrowser from '../render-in-browser';

const DELETE_FEED_MUTATION = gql`mutation ($id: ID!){
  deleteMyFeed ( id: $id ) { id }
}`;

const formatDates = ({ createdAt, lastUpdate }, { timeZone, locale }) => {
    const createdAtDate = new Date(createdAt);
    const lastUpdateDate = new Date(lastUpdate);
    let localCreatedAt;
    let localLastUpdate;
    // On NextJS server use information from GraphQL to create Date strings with user timezone and locale
    if (!process.browser || !timeZone || !locale) {
        try {
            localCreatedAt = createdAtDate.toLocaleDateString(locale, { timeZone });
            localLastUpdate = lastUpdateDate.toLocaleString(locale, { timeZone });
        } catch (e) {
            console.error(e);
        }
    }
    if (!localCreatedAt) localCreatedAt = createdAtDate.toLocaleDateString();
    if (!localLastUpdate) localLastUpdate = lastUpdateDate.toLocaleString();

    return { localCreatedAt, localLastUpdate };
};

const renderRow = ({ feedInfo, meInfo, setConfirmDelete, setEditFeed }) => {
    const title = feedInfo.feed.title || feedInfo.feed.link || feedInfo.feed.url;
    const { localCreatedAt, localLastUpdate } = formatDates(feedInfo, meInfo);
    return (
        <Tr key={feedInfo.id}>
            <Td data-name="FEED">
                <Link href={`/feeds/view?id=${feedInfo.id}`}><a href={`/feeds/view?id=${feedInfo.id}`} title="View items">{title}</a></Link>
            </Td>
            <Td minWidth="8rem" data-name="ADDED">
                <RenderInBrowser>
                    {localCreatedAt}
                </RenderInBrowser>
            </Td>
            <Td data-name="LAST DIGEST DATE"><RenderInBrowser>{localLastUpdate}</RenderInBrowser></Td>
            <Td data-name="DIGEST SCHEDULE">{`${periodNames[feedInfo.schedule] || feedInfo.schedule} digest` }</Td>
            <Td minWidth="8rem" data-name="ACTIONS">
                <div>
                    <ButtonWithIcon
                        clickHandler={({ currentTarget }) => {
                            /* Firefox loses focus after clicking on button
                             hence ReactModal's 'shouldReturnFocusAfterClose' option doesn't work */
                            currentTarget.focus();

                            setEditFeed({
                                isOpen: true,
                                feedInfo,
                            });
                        }}
                        Icon={EditIcon}
                        title="Edit the feed"
                    />
                    <ButtonWithIcon
                        clickHandler={() => {
                            setConfirmDelete({
                                isOpen: true,
                                title,
                                id: feedInfo.id,
                            });
                        }}
                        Icon={TrashIcon}
                        title="Delete the feed"
                    />
                </div>
            </Td>
        </Tr>);
};

const updateAfterDeletion = (dataProxy, mutationResult) => {
    try {
        const { id } = mutationResult.data.deleteMyFeed;
        const data = dataProxy.readQuery({ query: MY_FEEDS_QUERY });
        data.myFeeds = data.myFeeds.filter(feed => feed.id !== id);
        dataProxy.writeQuery({ query: MY_FEEDS_QUERY, data });
    } catch (e) {
        console.error(e);
    }
};

const ResponsiveTable = () => {
    const { data: meData } = useQuery(ME_QUERY);
    const { data, loading, error } = useQuery(MY_FEEDS_QUERY);
    const [deleteFeedMutation] = useMutation(DELETE_FEED_MUTATION, { update: updateAfterDeletion });
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, title: null, id: null });
    const [editFeed, setEditFeed] = useState({ isOpen: false, feedInfo: {} });
    const cancelBtnRef = useRef(null);
    useEffect(() => {
        ReactModal.setAppElement('body');
    }, []); // DOM doesn't exist on server so run setAppElement inside useEffect

    const feeds = get(data, 'myFeeds', []);
    const me = get(meData, 'me', {});
    if (error && error.message !== 'GraphQL error: Authentication is required') {
        console.error(error);
    }

    return (
        <>
            <Table>
                <Tr key="header">
                    <Th>FEED</Th>
                    <Th minWidth="8rem">ADDED</Th>
                    <Th>LAST DIGEST DATE</Th>
                    <Th>DIGEST SCHEDULE</Th>
                    <Th minWidth="8rem">ACTIONS</Th>
                </Tr>
                {loading ? 'loading...' : feeds.map(feedInfo => renderRow({ feedInfo, meInfo: me, setConfirmDelete, setEditFeed }))}
            </Table>
            <ReactModal
                isOpen={confirmDelete.isOpen}
                contentLabel="Confirm delete"
                shouldReturnFocusAfterClose={false}
                onRequestClose={() => setConfirmDelete({ isOpen: false })}
                onAfterOpen={() => cancelBtnRef.current.focus()}
                shouldCloseOnEsc
                shouldCloseOnOverlayClick
                style={{
                    overlay: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    content: {
                        position: 'static',
                        textAlign: 'center',
                    },
                }}
            >
                <div style={{ marginBottom: '1rem' }}>
                    <span>Are you sure you want to delete the feed: </span>
                    <b>{confirmDelete.title}</b>
                    <span>?</span>
                </div>
                <CancelButton
                    style={{ marginRight: '1rem' }}
                    onClick={() => setConfirmDelete({ isOpen: false })}
                    ref={cancelBtnRef}
                >
                    Cancel
                </CancelButton>
                <DeleteButton
                    onClick={async () => {
                        setConfirmDelete({ isOpen: false });
                        const { id } = confirmDelete;
                        try {
                            await deleteFeedMutation({
                                variables: { id },
                                optimisticResponse: {
                                    __typename: 'Mutation',
                                    deleteMyFeed: {
                                        __typename: 'UserFeed',
                                        id,
                                    },
                                },
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                >
                    Delete
                </DeleteButton>
            </ReactModal>
            <EditFeedSidebar editFeed={editFeed} setEditFeed={setEditFeed} />
        </>
    );
};

export default ResponsiveTable;
export { DELETE_FEED_MUTATION };

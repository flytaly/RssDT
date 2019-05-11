import React, { useState, useEffect, useRef } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo-hooks';
import get from 'lodash.get';
import ReactModal from 'react-modal';
import { Table, Th, Tr, Td, ButtonWithImg } from './styled-table-parts';
import { DeleteButton, CancelButton } from '../styled/buttons';
import trashIcon from '../../static/trash.svg';
import editIcon from '../../static/edit.svg';
import EditFeedSidebar from './edit-feed-sidebar';
import { periodNames } from '../../types/digest-periods';
import { MY_FEEDS_QUERY } from '../../queries';

const DELETE_FEED_MUTATION = gql`mutation ($id: ID!){
  deleteMyFeed ( id: $id ) { id }
}`;


const renderRow = (feedInfo, { setConfirmDelete, setEditFeed }) => {
    const title = feedInfo.feed.title || feedInfo.feed.link || feedInfo.feed.url;
    return (
        <Tr key={feedInfo.id}>
            <Td data-name="FEED">
                <a href={feedInfo.feed.url}>{title}</a>
            </Td>
            <Td minWidth="8rem" data-name="ADDED">
                {new Date(feedInfo.createdAt).toLocaleDateString()}
            </Td>
            <Td data-name="LAST DIGEST DATE">{new Date(feedInfo.lastUpdate).toLocaleString()}</Td>
            <Td data-name="DIGEST SCHEDULE">{`${periodNames[feedInfo.schedule] || feedInfo.schedule} digest` }</Td>
            <Td minWidth="8rem" data-name="ACTIONS">
                <div>
                    <ButtonWithImg
                        clickHandler={({ currentTarget }) => {
                            /* Firefox loses focus after clicking on button
                             hence ReactModal's 'shouldReturnFocusAfterClose' option doesn't work */
                            currentTarget.focus();

                            setEditFeed({
                                isOpen: true,
                                feedInfo,
                            });
                        }}
                        src={editIcon}
                        alt="Edit the feed"
                    />
                    <ButtonWithImg
                        clickHandler={() => {
                            setConfirmDelete({
                                isOpen: true,
                                title,
                                id: feedInfo.id,
                            });
                        }}
                        src={trashIcon}
                        alt="Delete the feed"
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
    const { data, loading, error } = useQuery(MY_FEEDS_QUERY);
    const deleteFeedMutation = useMutation(DELETE_FEED_MUTATION, { update: updateAfterDeletion });
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, title: null, id: null });
    const [editFeed, setEditFeed] = useState({ isOpen: false, feedInfo: {} });
    const cancelBtnRef = useRef(null);
    useEffect(() => {
        ReactModal.setAppElement('body');
    }, []); // DOM doesn't exist on server so run setAppElement inside useEffect

    const feeds = get(data, 'myFeeds', []);
    if (error && error.message !== 'GraphQL error: Authentication is required') {
        console.error(error);
    }

    return (
        <React.Fragment>
            <Table>
                <Tr key="header">
                    <Th>FEED</Th>
                    <Th minWidth="8rem">ADDED</Th>
                    <Th>LAST DIGEST DATE</Th>
                    <Th>DIGEST SCHEDULE</Th>
                    <Th minWidth="8rem">ACTIONS</Th>
                </Tr>
                {loading ? 'loading...' : feeds.map(feedInfo => renderRow(feedInfo, { setConfirmDelete, setEditFeed }))}
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
        </React.Fragment>
    );
};

export default ResponsiveTable;
export { DELETE_FEED_MUTATION };

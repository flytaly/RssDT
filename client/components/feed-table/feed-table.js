import React, { useState, useEffect, useRef } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import ReactModal from 'react-modal';
import {
    Table, Th, Tr, Td, ButtonWithImg,
} from './styled-table-parts';
import { DeleteButton, CancelButton } from '../styled/buttons';
import trashIcon from '../../static/trash.svg';
import editIcon from '../../static/edit.svg';

const MY_FEEDS_QUERY = gql`
    query MY_FEEDS_QUERY {
        myFeeds {
            id
            feed {
                url
                link
                title
                imageUrl
                imageTitle
            }
            schedule
            lastUpdate
            createdAt
        }
    }
`;

const renderRow = (feedInfo, setConfirmDelete) => {
    const title = feedInfo.feed.title || feedInfo.feed.link || feedInfo.feed.url;
    return (
        <Tr key={feedInfo.id}>
            <Td data-name="FEED">
                <a href={feedInfo.feed.url}>{title}</a>
            </Td>
            <Td minWidth="8rem" data-name="ADDED">
                {new Date(feedInfo.createdAt).toLocaleDateString()}
            </Td>
            <Td data-name="LAST UPDATE">{new Date(feedInfo.lastUpdate).toLocaleString()}</Td>
            <Td data-name="DIGEST SCHEDULE">{feedInfo.schedule}</Td>
            <Td minWidth="8rem" data-name="ACTIONS">
                <div>
                    <ButtonWithImg
                        clickHandler={() => {
                            console.log('click');
                        }}
                        src={editIcon}
                        alt="Edit the feed"
                    />
                    <ButtonWithImg
                        clickHandler={() => {
                            setConfirmDelete({
                                isOpen: true,
                                title,
                            });
                        }}
                        src={trashIcon}
                        alt="Delete the feed"
                    />
                </div>
            </Td>
        </Tr>);
};
const ResponsiveTable = () => {
    const { data, loading, error } = useQuery(MY_FEEDS_QUERY);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, title: null });
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
                    <Th>LAST UPDATE</Th>
                    <Th>DIGEST SCHEDULE</Th>
                    <Th minWidth="8rem">ACTIONS</Th>
                </Tr>
                {loading ? 'loading...' : feeds.map(feedInfo => renderRow(feedInfo, setConfirmDelete))}
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
                    onClick={() => {
                        // TODO: run delete mutation
                        setConfirmDelete({ isOpen: false });
                    }}
                >
                    Delete
                </DeleteButton>
            </ReactModal>
        </React.Fragment>
    );
};

export default ResponsiveTable;
export { MY_FEEDS_QUERY };

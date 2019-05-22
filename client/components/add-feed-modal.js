import React, { useState } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { useGlobalState, useDispatch, types } from './state';
import AddFeedForm from './welcome/add-feed-form';
import GraphQLError from './graphql-error';

const Message = styled.div`
    border: 1px solid ${props => props.color};
    color: ${props => props.color};
    padding: 1rem;
    word-break: break-word;
    border-radius: 3px;
`;

const AddNewFeedModal = () => {
    const [messages, setMessages] = useState({ error: '', success: '' });
    const { error, success } = messages;
    const modal = useGlobalState('newFeedModal');
    const dispatch = useDispatch();
    const toggleModal = () => { dispatch({ type: types.toggleNewFeedModal }); };

    return (
        <ReactModal
            isOpen={modal.isOpen}
            contentLabel="Add new feed"
            shouldReturnFocusAfterClose
            onRequestClose={() => toggleModal()}
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
            {(error || success) && (
                <Message color={error ? 'red' : 'green'}>
                    {error && <GraphQLError error={error} />}
                    {success}
                </Message>)
            }
            <AddFeedForm setMessages={setMessages} />
        </ReactModal>
    );
};

export default AddNewFeedModal;

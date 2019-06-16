import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import EditFeedContent from './edit-feed-sidebar-content';

const EditFeedSidebar = ({ editFeed, setEditFeed }) => {
    useEffect(() => {
        ReactModal.setAppElement('body');
    }, []);

    useEffect(() => {
        if (editFeed.isOpen) window.scrollTo(0, 0);
    }, [editFeed.isOpen]);

    return (
        <ReactModal
            isOpen={editFeed.isOpen}
            contentLabel="Edit feed"
            shouldReturnFocusAfterClose
            onRequestClose={() => setEditFeed({ isOpen: false })}
            parentSelector={() => document.querySelector('#bigCard') || document.querySelector('body')}
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
            defaultStyles={{
                overlay: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
                content: {
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    top: 0,
                    width: '40rem',
                    maxWidth: '100%',
                    border: '1px solid #B3B3B3',
                    background: '#F5F5F5',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '1rem 2rem',
                },
            }}
        >
            {editFeed.feedInfo && <EditFeedContent
                feedInfo={editFeed.feedInfo}
                closeSidebar={() => setEditFeed({ isOpen: false })}
            />}
        </ReactModal>
    );
};

EditFeedSidebar.propTypes = {
    editFeed: PropTypes.shape({
        isOpen: PropTypes.bool.isRequired,
        feedInfo: PropTypes.object,
    }),
    setEditFeed: PropTypes.func,
};
EditFeedSidebar.defaultProps = {
    editFeed: { isOpen: false },
    setEditFeed: () => {},
};

export default EditFeedSidebar;

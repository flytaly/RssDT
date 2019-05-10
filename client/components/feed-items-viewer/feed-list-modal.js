import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledModalContent = styled.div`
    width: 100%;
    min-height: 100%;
    background-color: ${props => props.theme.feedListBgColor};
    padding: 2rem 0;
    color: ${props => props.theme.feedListFontColor};
`;

const FeedListModalSidebar = ({ modalInfo, setModalInfo, children }) => {
    useEffect(() => {
        ReactModal.setAppElement('main');
    }, []);

    return (
        <ReactModal
            isOpen={modalInfo.isOpen}
            contentLabel="The list of your feeds"
            shouldReturnFocusAfterClose
            onRequestClose={() => setModalInfo({ isOpen: false })}
            parentSelector={() => document.querySelector('main') || document.querySelector('body')}
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
                    borderRadius: '9px',
                },
                content: {
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    top: 0,
                    width: '50%',
                    minWidth: '15rem',
                    maxWidth: '100%',
                    backgroundColor: '#F5F5F5',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '0 0 0 9px',
                    outline: 'none',
                    padding: '0',
                },
            }}
        >
            <StyledModalContent>
                {children}
            </StyledModalContent>
        </ReactModal>
    );
};

FeedListModalSidebar.propTypes = {
    modalInfo: PropTypes.shape({
        isOpen: PropTypes.bool.isRequired,
    }),
    setModalInfo: PropTypes.func,
    children: PropTypes.node.isRequired,
};
FeedListModalSidebar.defaultProps = {
    modalInfo: { isOpen: false },
    setModalInfo: () => {},
};

export default FeedListModalSidebar;

import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view';

const JsonViewModal = ({ isOpen, jsonData, closeModal }) => {
    useEffect(() => {
        ReactModal.setAppElement('#root');
    }, []);
    return (
        <ReactModal
            isOpen={isOpen}
            shouldReturnFocusAfterClose
            onRequestClose={closeModal}
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
        >
            <ReactJson src={jsonData} collapsed={2} />
        </ReactModal>
    );
};
JsonViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    jsonData: PropTypes.any,
    closeModal: PropTypes.func.isRequired,
};
JsonViewModal.defaultProps = {
    jsonData: {},
};


export default JsonViewModal;

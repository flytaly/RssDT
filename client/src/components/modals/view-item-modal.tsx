import React from 'react';
import Modal from 'react-modal';
import { isServer } from '../../utils/is-server';

const customStyles: Modal.Styles = {
  overlay: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(221, 221, 221, 0.9)',
    overflowY: 'scroll',
    padding: '3rem',
  },
  content: {
    position: 'static',
    width: 'auto',
    height: 'auto',
    background: 'white',
    border: 'none',
    // outline: '2px dashed black',
    padding: 0,
    overflow: 'visible',
  },
};

interface ViewItemModalProps {
  isOpen: boolean;
  onRequestClose: () => any;
}

const ViewItemModal: React.FC<ViewItemModalProps> = ({ isOpen, onRequestClose, children }) => {
  return (
    <Modal
      appElement={isServer() ? undefined : document.body}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      role="article"
    >
      {children}
    </Modal>
  );
};

export default ViewItemModal;

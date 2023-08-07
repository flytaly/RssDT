import React from 'react';
import Modal from 'react-modal';

import { getAppElement } from '@/utils/get-app-element';

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
    margin: 'auto',
  },
};

interface ViewItemModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  onRequestClose: () => any;
}

const ViewItemModal = ({ isOpen, onRequestClose, children }: ViewItemModalProps) => {
  return (
    <Modal
      appElement={getAppElement(false)}
      isOpen={isOpen}
      onAfterOpen={() => document.body.classList.add('overflow-hidden')}
      onAfterClose={() => document.body.classList.remove('overflow-hidden')}
      onRequestClose={onRequestClose}
      style={customStyles}
      role="article"
    >
      {children}
    </Modal>
  );
};

export default ViewItemModal;

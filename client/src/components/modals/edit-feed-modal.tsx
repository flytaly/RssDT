/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';
import { UserFeed } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';

interface EditFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
  feed?: UserFeed | null;
}

const customStyles: Modal.Styles = {
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    position: 'absolute',
    top: '0',
    left: 'auto',
    right: '0',
    bottom: '0',
    height: '100%',
    width: '24rem',
    background: 'none',
    border: 'none',
    padding: 0,
    overflow: 'visible',
  },
};

const EditFeedModal: React.FC<EditFeedModalProps> = ({ isOpen, closeModal, feed }) => {
  const closingDuration = 100;
  const springProps = useSpring({
    transformOrigin: 'right center',
    transform: isOpen ? 'scale3d(1,1,1)' : 'scale3d(0,1,0)',
    config: { tension: 340, friction: 30, duration: isOpen ? undefined : closingDuration },
  });
  return (
    <Modal
      appElement={isServer() ? undefined : document.querySelector('#card-root') || document.body}
      parentSelector={() => document.querySelector('#card-root') as HTMLElement}
      isOpen={isOpen}
      closeTimeoutMS={closingDuration + 10}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Edit feed"
    >
      <animated.div
        style={springProps}
        className="bg-gray-100 p-6 border border-gray rounded-md max-w-full text-center shadow-modal-right h-full"
      >
        <h3>{feed?.feed.title}</h3>
      </animated.div>
    </Modal>
  );
};

export default EditFeedModal;

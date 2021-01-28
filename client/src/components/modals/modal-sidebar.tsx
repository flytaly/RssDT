import React from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';
import { isServer } from '../../utils/is-server';

const customStyles = (right: boolean): Modal.Styles => ({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '0.375rem',
  },
  content: {
    position: 'absolute',
    top: '0',
    left: right ? 'auto' : 0,
    right: right ? '0' : 'auto',
    bottom: '0',
    height: '100%',
    width: '24rem',
    background: 'none',
    border: 'none',
    padding: 0,
    overflow: 'visible',
  },
});

interface ModalSidebarProps {
  isOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
  contentLabel?: string;
  /** Sidebar position: on the right or on the left of ther contarien */
  right?: boolean;
}

const ModalSidebar: React.FC<ModalSidebarProps> = ({
  isOpen,
  closeModal,
  children,
  contentLabel,
  right = true,
}) => {
  const closingDuration = 100;
  const springProps = useSpring({
    transformOrigin: `${right ? 'right' : 'left'} center`,
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
      style={customStyles(right)}
      contentLabel={contentLabel}
    >
      <animated.div
        style={springProps}
        className={`border-gray rounded-md h-full max-w-full ${
          right ? 'border-l shadow-modal-right' : 'border-r shadow-modal-left'
        }`}
      >
        {children}
      </animated.div>
    </Modal>
  );
};

export default ModalSidebar;

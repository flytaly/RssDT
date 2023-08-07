import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';

import { getAppElement } from '@/utils/get-app-element';

const customStyles = (right: boolean): Modal.Styles => ({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '0.375rem',
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: '0',
    left: right ? 'auto' : '0',
    right: right ? '0' : 'auto',
    bottom: '0',
    height: '100%',
    width: '24rem',
    background: 'none',
    border: 'none',
    padding: 0,
    overflow: 'visible',
    maxWidth: '100%',
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

const ModalSidebar = ({
  isOpen,
  closeModal,
  children,
  contentLabel,
  right = true,
}: ModalSidebarProps) => {
  const closingDuration = 100;
  const translate = right ? 'translate3d(100%, 0, 0)' : 'translate3d(-100%, 0, 0)';
  const springProps = useSpring({
    transform: isOpen ? 'translate3d(0%, 0, 0)' : translate,
    config: { tension: 340, friction: 30, duration: isOpen ? undefined : closingDuration },
  });

  useEffect(() => {
    if (isOpen) window.scrollTo(0, 0);
  }, [isOpen]);

  return (
    <Modal
      appElement={getAppElement()}
      parentSelector={() => document.querySelector('#card-root') as HTMLElement}
      isOpen={isOpen}
      closeTimeoutMS={closingDuration + 10}
      onRequestClose={closeModal}
      style={customStyles(right)}
      contentLabel={contentLabel}
      shouldReturnFocusAfterClose
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

import React, { useState } from 'react';
import Modal from 'react-modal';
import { useMeQuery } from '../generated/graphql';
import { MessageItem } from './main-card/animated-message';
import MessageBlock from './message-block';

interface AddFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const customStyles: Modal.Styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'none',
    border: 'none',
  },
};

const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, closeModal }) => {
  const { data } = useMeQuery();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <Modal
      isOpen={isOpen}
      //   onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add feed form"
    >
      <div className="bg-gray-100 p-6 border border-gray rounded-md">
        <MessageBlock items={messages} />
        <h2 className="text-lg font-bold text-center pb-2">Add new feed</h2>
        <form className="flex flex-col">
          <input type="text" />
          <button type="submit" className="btn bg-tertiary">
            Add
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AddFeedModal;

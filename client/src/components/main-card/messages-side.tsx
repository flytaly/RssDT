import React from 'react';
import MessageBlock from '../message-block';
import { MessageItem } from './animated-message';

interface MessagesSideProps {
  items: MessageItem[];
}

const MessagesSide: React.FC<MessagesSideProps> = ({ items }) => {
  return (
    <section className="relative flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
      <MessageBlock items={items} />
    </section>
  );
};

export default MessagesSide;

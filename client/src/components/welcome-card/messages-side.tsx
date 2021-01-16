import React from 'react';
import AnimatedMessage, { MessageItem, useEmergeTransition } from './animated-message';

interface MessagesSideProps {
  items: MessageItem[];
}

const MessagesSide: React.FC<MessagesSideProps> = ({ items }) => {
  const transitions = useEmergeTransition(items);
  return (
    <section className="flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
      {transitions.map(({ item, props, key }) => {
        return (
          <AnimatedMessage key={key} style={props} text={item.text} withline>
            {item.content ? item.content : null}
          </AnimatedMessage>
        );
      })}
    </section>
  );
};

export default MessagesSide;

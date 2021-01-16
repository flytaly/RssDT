import React from 'react';
import AnimatedMessage, { MessageItem, useEmergeTransition } from './animated-message';
import AlertCircleIcon from '../../../public/static/alert-circle.svg';
import CheckCircleIcon from '../../../public/static/check-circle.svg';

interface MessagesSideProps {
  items: MessageItem[];
}

const MessagesSide: React.FC<MessagesSideProps> = ({ items }) => {
  const transitions = useEmergeTransition(items);
  return (
    <section className="flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
      {transitions.map(({ item, props, key }) => {
        const Icon: typeof CheckCircleIcon | null | undefined =
          item.type &&
          { error: AlertCircleIcon, success: CheckCircleIcon, default: null }[item.type];
        return (
          <AnimatedMessage
            key={key}
            style={props}
            text={item.text}
            type={item.type}
            withline={item.type !== 'error' && item.type !== 'success'}
          >
            {Icon && <Icon className="w-5 h-5 mr-3 flex-shrink-0" />}
            {item.content ? item.content : null}
          </AnimatedMessage>
        );
      })}
    </section>
  );
};

export default MessagesSide;

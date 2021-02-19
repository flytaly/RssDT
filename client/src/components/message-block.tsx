import React from 'react';
import AnimatedMessage, { MessageItem, useEmergeTransition } from './main-card/animated-message';
import AlertCircleIcon from '../../public/static/alert-circle.svg';
import CheckCircleIcon from '../../public/static/check-circle.svg';

interface MessageBlockProps {
  items: MessageItem[];
}

const MessageBlock: React.FC<MessageBlockProps> = ({ items }) => {
  const transitions = useEmergeTransition(items);
  return (
    <>
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
    </>
  );
};

export default MessageBlock;

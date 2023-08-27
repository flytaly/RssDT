'use client';
import React from 'react';

import AlertCircleIcon from '@/../public/static/alert-circle.svg';
import CheckCircleIcon from '@/../public/static/check-circle.svg';
import AnimatedMessage, {
  MessageItem,
  useEmergeTransition,
} from '@/components/card/animated-message';

interface MessageBlockProps {
  items: MessageItem[];
}

const MessageBlock = ({ items }: MessageBlockProps) => {
  const transitions = useEmergeTransition(items);

  const fragment = transitions((style, item) => {
    const Icon: typeof CheckCircleIcon | null | undefined =
      item.type && { error: AlertCircleIcon, success: CheckCircleIcon, default: null }[item.type];
    // 3. Render each item
    return (
      <AnimatedMessage
        key={item.key}
        style={style}
        text={item.text}
        type={item.type}
        withline={item.type !== 'error' && item.type !== 'success'}
      >
        {Icon && <Icon className="w-5 h-5 mr-3 flex-shrink-0" />}
        {item.content ? item.content : null}
      </AnimatedMessage>
    );
  });

  return fragment;

  /* return (
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
  ); */
};

export default MessageBlock;

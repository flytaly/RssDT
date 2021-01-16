import React from 'react';
import { useTransition, animated } from 'react-spring';

export type MessageType = 'error' | 'success' | 'default';

export type MessageItem = {
  key: string | number;
  text?: string;
  content?: JSX.Element;
  type?: MessageType;
};

export const useEmergeTransition = (items: MessageItem[]) =>
  useTransition(items, (item) => item.key, {
    config: { mass: 1, friction: 12 },
    from: { transform: 'translate3d(0, 100%, 0)', opacity: 0 },
    enter: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    leave: { position: 'absolute' },
  });

interface AnimatedMessageProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  text?: string;
  withline?: boolean;
  type?: MessageType;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({
  children,
  style,
  text,
  withline = false,
  type,
}) => {
  let colors = 'shadow-message hover:shadow-message-darker';
  if (type === 'error') {
    colors = 'text-error shadow-message-err hover:shadow-message-err-darker';
  } else if (type === 'success') {
    colors = 'text-success shadow-message-success hover:shadow-message-success-darker';
  }

  return (
    <animated.div
      style={style}
      className={`group flex items-center text-sm p-2 my-2 mx-2 w-full rounded-md break-words ${colors}`}
    >
      {withline ? (
        <div className="flex-shrink-0 bg-gray group-hover:bg-primary h-full w-1 mr-2 rounded-xl" />
      ) : null}
      {children}
      {text ? <span>{text}</span> : null}
    </animated.div>
  );
};

export default AnimatedMessage;

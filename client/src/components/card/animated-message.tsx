import React from 'react';
import { useTransition, animated } from 'react-spring';

export type MessageType = 'error' | 'success' | 'default';

export type MessageItem = {
  key: string | number;
  text?: string;
  content?: JSX.Element;
  type?: MessageType;
  static?: boolean;
};

export const useEmergeTransition = (items: MessageItem[]) => {
  const from = { transform: 'translate3d(0, 100%, 0)', opacity: 0 };
  return useTransition(items, {
    keys: (item) => item.key,
    config: { mass: 1, friction: 12 },
    from,
    enter: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    leave: { transform: 'translate3d(0, 0, 0)' },
    initial: (item: MessageItem) => (item.static ? null : from),
  });
};

interface AnimatedMessageProps {
  children: React.ReactNode;
  style?: any;
  text?: string;
  withline?: boolean;
  type?: MessageType;
}

const AnimatedMessage = ({
  children,
  style,
  text,
  withline = false,
  type,
}: AnimatedMessageProps) => {
  let colors = 'shadow-message hover:shadow-message-darker';
  if (type === 'error') {
    colors = 'text-error shadow-message-err hover:shadow-message-err-darker';
  } else if (type === 'success') {
    colors = 'text-success shadow-message-success hover:shadow-message-success-darker';
  }

  return (
    <animated.div
      style={style}
      className={`group flex text-sm p-2 my-2 mx-2 w-full rounded-md break-words bg-gray-50 max-h-36 overflow-y-auto ${colors}`}
    >
      {withline ? (
        <div className="flex-shrink-0 bg-gray group-hover:bg-primary h-full w-1 mr-2 rounded-xl" />
      ) : null}
      {children}
      {text ? <span className={text?.length > 200 ? 'break-all' : ''}>{text}</span> : null}
    </animated.div>
  );
};

export default AnimatedMessage;

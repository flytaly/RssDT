import React from 'react';
import { useTransition, animated } from 'react-spring';

export type MessageItem = {
  key: string | number;
  text?: string;
  content?: JSX.Element;
};

export const useEmergeTransition = (items: MessageItem[]) =>
  useTransition(items, (item) => item.key, {
    from: { transform: 'translate3d(0, 100%, 0)', opacity: 0 },
    enter: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    leave: { position: 'absolute' },
  });

interface AnimatedMessageProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  text?: string;
  withline?: boolean;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({
  children,
  style,
  text,
  withline = false,
}) => {
  return (
    <animated.div
      style={style}
      className="group flex items-center text-sm p-2 my-2 mx-2 w-full rounded-md shadow-message hover:shadow-message-darker"
    >
      {withline ? (
        <div className="flex-shrink-0 bg-gray group-hover:bg-primary h-full w-1 mr-2 rounded-xl" />
      ) : null}
      {text ? <span>{text}</span> : null}
      {children}
    </animated.div>
  );
};

export default AnimatedMessage;

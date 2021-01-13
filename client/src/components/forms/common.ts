import { ReactNode, useState } from 'react';

export type FocusEvent = React.FocusEvent<HTMLInputElement | HTMLSelectElement>;

export interface CommonProps {
  IconSVG?: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  error?: string;
  title?: string;
  touched?: boolean;
  tag?: 'input' | 'select';
  children?: ReactNode;
}

export function useInputClasses() {
  const [isFocused, setIsFocused] = useState(false);
  const borderCol = isFocused ? 'border-primary' : '';
  const iconCol = isFocused ? 'text-primary' : 'text-gray';
  const shadowColor = isFocused ? 'shadow-input-primary' : 'hover:shadow-input-gray';

  const classes = {
    label: `flex items-center w-full p-2 rounded-3xl border hover:border-2 border-gray  ${borderCol} ${shadowColor}`,
    iconContainer: `h-5 w-5 ${iconCol}`,
    icon: 'fill-current w-full h-full',
    input: 'outline-none bg-transparent ml-2 w-full',
    error: 'h-5 text-sm text-red-800 ml-8',
  };

  return { classes, setIsFocused };
}

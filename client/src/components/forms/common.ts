import { useState } from 'react';

export type FocusEvent = React.FocusEvent<HTMLInputElement | HTMLSelectElement>;

export interface CommonProps {
  error?: string;
  IconSVG?: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  id?: string;
  onBlur?: (event: FocusEvent) => void;
  onChange: (event: React.ChangeEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  title?: string;
  touched?: boolean;
  disabled?: boolean;
  type?: string;
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
    error: 'text-sm text-red-800 ml-8 min-h-5 mb-2',
  };

  return { classes, setIsFocused };
}

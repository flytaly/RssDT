import { ReactNode } from 'react';

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

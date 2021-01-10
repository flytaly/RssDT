/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useRef, JSXElementConstructor, ImgHTMLAttributes } from 'react';

interface InputProps {
  IconSVG?: JSXElementConstructor<any>;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  title?: string;
  touched?: boolean;
}

const Input: React.FC<InputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputEl = useRef<HTMLInputElement>(null);
  const { IconSVG, onFocus, onBlur, error = '', title = '', touched = false } = props;

  const borderCol = isFocused ? 'border-primary' : '';
  const iconCol = isFocused ? 'text-primary' : 'text-gray-500';
  return (
    <div className="mb-5">
      <label
        className={`flex items-center w-full p-2 rounded-3xl border hover:border-2 border-gray-500 hover:border-primary ${borderCol} hover:shadow-input`}
        onClick={() => inputEl.current?.focus()}
        title={title}
      >
        <div className={`h-5 w-5 ${iconCol}`}>
          {IconSVG ? <IconSVG className="fill-current w-full h-full" /> : null}
        </div>
        <input
          {...props}
          className="outline-none bg-transparent ml-1"
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          ref={inputEl}
          aria-label={title}
        />
      </label>
      <div className="h-5 text-sm text-red-800 ml-8">{error && touched ? error : ''}</div>
    </div>
  );
};

export default Input;

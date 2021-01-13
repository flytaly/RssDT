/* eslint-disable
  jsx-a11y/control-has-associated-label,
  jsx-a11y/no-noninteractive-element-interactions,
  jsx-a11y/click-events-have-key-events,
  jsx-a11y/label-has-associated-control
*/
import React, { useState, useRef } from 'react';
import { CommonProps } from './types';

interface InputProps extends CommonProps {
  //
}

const Input: React.FC<InputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputEl = useRef<HTMLInputElement>(null);
  const { IconSVG, onFocus, onBlur, error = '', title = '', touched = false } = props;

  const borderCol = isFocused ? 'border-primary' : '';
  const iconCol = isFocused ? 'text-primary' : 'text-gray';
  const shadowColor = isFocused ? 'shadow-input-primary' : 'hover:shadow-input-gray';

  return (
    <div className="mb-3 w-full">
      <label
        className={`flex items-center w-full p-2 rounded-3xl border hover:border-2 border-gray  ${borderCol} ${shadowColor}`}
        onClick={() => inputEl.current?.focus()}
        title={title}
      >
        <div className={`h-5 w-5 ${iconCol}`}>
          {IconSVG ? <IconSVG className="fill-current w-full h-full" /> : null}
        </div>
        <input
          className="outline-none bg-transparent ml-1 w-full"
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

/* eslint-disable
  jsx-a11y/control-has-associated-label,
  jsx-a11y/no-noninteractive-element-interactions,
  jsx-a11y/click-events-have-key-events,
  jsx-a11y/label-has-associated-control
*/
import React, { useRef } from 'react';
import { CommonProps, useInputClasses } from './common';

interface InputProps extends CommonProps {
  //
}

const Input: React.FC<InputProps> = (props) => {
  const inputEl = useRef<HTMLInputElement>(null);
  const { IconSVG, onFocus, onBlur, error = '', title = '', touched = false } = props;

  const { classes, setIsFocused } = useInputClasses();

  return (
    <div className="mb-3 w-full">
      <label className={classes.label} onClick={() => inputEl.current?.focus()} title={title}>
        <div className={classes.iconContainer}>
          {IconSVG ? <IconSVG className={classes.icon} /> : null}
        </div>
        <input
          className={classes.input}
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
      <div className={classes.error}>{error && touched ? error : ''}</div>
    </div>
  );
};

export default Input;

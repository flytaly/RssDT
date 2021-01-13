/* eslint-disable
  jsx-a11y/control-has-associated-label,
  jsx-a11y/no-noninteractive-element-interactions,
  jsx-a11y/click-events-have-key-events,
  jsx-a11y/label-has-associated-control
*/
import React, { useRef } from 'react';
import { CommonProps, useInputClasses } from './common';

interface SelectProps extends CommonProps {
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  IconSVG,
  onFocus,
  onBlur,
  error = '',
  title = '',
  touched = false,
  children,
}) => {
  const inputEl = useRef<HTMLSelectElement>(null);

  const { classes, setIsFocused } = useInputClasses();

  return (
    <div className="mb-3 w-full">
      <label className={classes.label} onClick={() => inputEl.current?.focus()} title={title}>
        <div className={classes.iconContainer}>
          {IconSVG ? <IconSVG className={classes.icon} /> : null}
        </div>
        <select
          className={`${classes.input} select`}
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
        >
          {children}
        </select>
      </label>
      <div className={classes.error}>{error && touched ? error : ''}</div>
    </div>
  );
};

export default Select;

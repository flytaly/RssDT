/* eslint-disable
  jsx-a11y/control-has-associated-label,
  jsx-a11y/no-noninteractive-element-interactions,
  jsx-a11y/click-events-have-key-events,
*/
import React, { useRef } from 'react';
import { CommonProps, useInputClasses } from './common';

interface SelectProps extends CommonProps {
  children: React.ReactNode;
  defaultValue: string | number | readonly string[] | undefined;
}

const Select: React.FC<SelectProps> = ({
  children,
  defaultValue,
  error = '',
  IconSVG,
  id,
  onBlur,
  onChange,
  onFocus,
  title = '',
  touched = false,
}) => {
  const inputEl = useRef<HTMLSelectElement>(null);

  const { classes, setIsFocused } = useInputClasses();

  return (
    <div className="mb-3 w-full">
      <label
        htmlFor={id}
        className={classes.label}
        onClick={() => inputEl.current?.focus()}
        title={title}
      >
        <div className={classes.iconContainer}>
          {IconSVG ? <IconSVG className={classes.icon} /> : null}
        </div>
        <select
          id={id}
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
          defaultValue={defaultValue}
          onChange={onChange}
        >
          {children}
        </select>
      </label>
      <div className={classes.error}>{error && touched ? error : ''}</div>
    </div>
  );
};

export default Select;

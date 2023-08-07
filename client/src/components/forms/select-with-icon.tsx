import React, { useRef } from 'react';

import { CommonProps, useInputClasses } from './common';

interface SelectWithIconProps extends CommonProps {
  children: React.ReactNode;
  defaultValue: string | number | readonly string[] | undefined;
}

const SelectWithIcon = ({
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
}: SelectWithIconProps) => {
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

export default SelectWithIcon;

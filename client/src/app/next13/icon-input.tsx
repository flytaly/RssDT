import React, { useRef, useState } from 'react';

interface IconInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  error?: string;
  IconSVG?: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
}

export default function InputWithIcon({
  error = '',
  IconSVG,
  id,
  onBlur,
  onFocus,
  title = '',
  ...restProps
}: IconInputProps) {
  const inputEl = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const ringCol = isFocused ? 'ring-primary' : '';
  const iconCol = isFocused ? 'text-primary' : 'text-gray';
  const shadowColor = isFocused ? 'shadow-input-primary' : 'hover:shadow-input-gray';

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`flex items-center w-full p-2 rounded-3xl ring-1 hover:ring-2 ring-gray ${ringCol} ${shadowColor}`}
        onClick={() => inputEl.current?.focus()}
        title={title}
      >
        <div className={`h-5 w-5 ${iconCol}`}>
          {IconSVG ? <IconSVG className="fill-current w-full h-full" /> : null}
        </div>
        <input
          id={id}
          className="outline-none bg-transparent ml-2 w-full"
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
          {...restProps}
        />
      </label>
      <div className="text-sm text-red-800 ml-8 min-h-5 mb-2">{error ? error : ''}</div>
    </div>
  );
}

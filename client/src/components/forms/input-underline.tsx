import React from 'react';

export type InputUnderlineProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const InputUnderline: React.FC<InputUnderlineProps> = ({ className, ...props }) => {
  return (
    <input
      className={`bg-transparent border-b-2 border-gray-500 focus:border-primary placeholder-gray-700 focus:bg-white hover:bg-white ${className}`}
      {...props}
    />
  );
};

export default InputUnderline;

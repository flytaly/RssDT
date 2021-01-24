import React from 'react';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const InputUnderline: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`bg-transparent border-b-2 border-gray-500 focus:border-primary placeholder-gray-700 ${className}`}
      {...props}
    />
  );
};

export default InputUnderline;

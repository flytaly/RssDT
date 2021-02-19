import React from 'react';

export type SelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const SelectUnderline: React.FC<SelectProps> = ({ className, ...props }) => {
  return (
    <select
      className={`select w-full border-b-2 border-gray-500 focus:border-primary
      bg-transparent focus:bg-white hover:bg-white rounded-sm ${className}`}
      {...props}
    />
  );
};

export default SelectUnderline;

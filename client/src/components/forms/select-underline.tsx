import React from 'react';

const SelectUnderline: React.FC<
  React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
> = ({ className, ...props }) => {
  return (
    <select
      className={`select w-full border-b-2 border-gray-500 focus:border-primary bg-gray-100 rounded-sm ${className}`}
      {...props}
    />
  );
};

export default SelectUnderline;

import React from 'react';

interface CheckBoxProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  id: string;
}

const CheckBox: React.FC<CheckBoxProps> = ({ id, className, title, checked, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        className={`absolute opacity-0 ${className}`}
        id={id}
        type="checkbox"
        checked={checked}
        {...props}
      />
      <label
        htmlFor={id}
        title={title}
        className="block p-px w-4 h-4 border border-primary rounded"
      >
        {checked ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
          </svg>
        ) : null}
      </label>
    </div>
  );
};

export default CheckBox;

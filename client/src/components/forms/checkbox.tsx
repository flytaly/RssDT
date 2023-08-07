import React from 'react';

interface CheckBoxProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  id: string;
}

const CheckBox = ({ id, className, title, checked, disabled, ...props }: CheckBoxProps) => {
  return (
    <div className="flex items-center">
      <input className="absolute opacity-0" id={id} type="checkbox" checked={checked} {...props} />
      <label
        htmlFor={id}
        title={title}
        className={`block p-px w-4 h-4 border rounded ${className || 'border-primary'} ${
          disabled ? 'opacity-30' : ''
        }`}
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

interface LabeledCheckboxProps extends CheckBoxProps {
  labelContent: React.ReactNode;
}

export const LabeledCheckbox = ({ id, labelContent, disabled, ...props }: LabeledCheckboxProps) => (
  <div className="flex items-center">
    <CheckBox id={id} disabled={disabled} {...props} />
    <label htmlFor={id} className={`ml-1 ${disabled ? 'opacity-50' : ''}`}>
      {labelContent}
    </label>
  </div>
);
export default CheckBox;

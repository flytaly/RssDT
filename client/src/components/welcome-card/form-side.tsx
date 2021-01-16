import React from 'react';

const FormSide: React.FC = ({ children }) => {
  return (
    <section className="flex-grow bg-gray-300 bg-opacity-60 rounded-md border-1 border-gray-500 border-solid border p-3 px-12 md:w-1/2">
      {children}
    </section>
  );
};

export default FormSide;

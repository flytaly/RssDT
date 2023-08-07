import React from 'react';

const FormSide = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex-grow flex flex-col justify-center bg-gray-300 bg-opacity-60 rounded-md border-1 border-gray-500 border-solid border p-3 px-12 md:w-1/2">
      {children}
    </section>
  );
};

export default FormSide;

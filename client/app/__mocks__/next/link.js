import React from 'react';

const Link = jest.fn(({ children, href }) => React.cloneElement(children, { href }));

export default Link;

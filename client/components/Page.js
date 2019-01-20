import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import Meta from './Meta';

const StyledPage = styled.div`
  color: black;
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto');
  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    height: 100%;
    font-size: 62.5%;
  }
  body {
    background-image: linear-gradient(#D049C5, #262B68);
    background-attachment: fixed;
    height: 100%;
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
    font-family: Roboto, sans-serif;
    line-height: normal;
  }
`;

const Page = ({ children }) => (
    <StyledPage>
        <GlobalStyle />
        <Meta />
        {children}
    </StyledPage>
);

Page.propTypes = {
    children: PropTypes.element.isRequired,
};

export default Page;

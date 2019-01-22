import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import PropTypes from 'prop-types';
import Meta from './meta';
import theme from './themes/default';

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
    background: ${props => props.theme.pageBackground};
    height: 100%;
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
    font-family: Roboto, sans-serif;
    line-height: normal;
  }
`;

const Page = ({ children }) => (
    <ThemeProvider theme={theme}>
        <StyledPage>
            <GlobalStyle />
            <Meta />
            {children}
        </StyledPage>
    </ThemeProvider>
);

Page.propTypes = {
    children: PropTypes.element.isRequired,
};

export default Page;

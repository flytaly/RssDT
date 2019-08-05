import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import PropTypes from 'prop-types';
import Meta from './meta';
import theme from './themes/default';
import '@reach/menu-button/styles.css';
import Logo from './logo';

const StyledPage = styled.div`
  color: black;
`;

const GlobalStyle = createGlobalStyle`
  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    height: 100%;
    font-size: 62.5%;
  }
  body {
    background: ${props => props.theme.pageBackground};
    padding: 0;
    margin: 0;
    font-size: 1.3rem;
    font-family: Roboto, sans-serif;
    line-height: normal;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem;
`;
const Center = styled.div`
  align-self: center;
`;

const Page = ({ children }) => (
    <ThemeProvider theme={theme}>
        <StyledPage>
            <GlobalStyle />
            <Meta />
            <Container>
                <Center>
                    <Logo />
                    {children}
                </Center>
            </Container>
        </StyledPage>
    </ThemeProvider>
);

Page.propTypes = {
    children: PropTypes.element.isRequired,
};

export default Page;

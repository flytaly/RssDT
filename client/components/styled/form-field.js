import styled, { css } from 'styled-components';

const Container = styled.label`
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 4.5rem;
    max-width: 100%;
    padding: 1rem;
    margin-bottom: 2.8rem;
    background-color: ${props => props.theme.greyMedium};
    border: ${props => (props.focus
        ? `2px solid ${props.theme.btnColor1}`
        : `1px solid ${props.theme.greyDark}`)};
    border-radius: 30px;
    :hover {
        border-width: 2px;
    }
`;
const Image = styled.img`
    width: 2rem;
    height: 2rem;
`;

// use 'as' to change tag from div to input, select... https://www.styled-components.com/docs/api#as-polymorphic-prop
// 'appearance: none'  is necessary for removing Safari's gloss but it also removes select arrows
const Field = styled.div`
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    flex: 1 0 auto;
    margin-left: 0.5rem;
    height: 100%;
    font-size: 1.6rem;
    border: none;
    outline: none;
    box-shadow: none;
    ${props => props.as === 'select' && css`
        background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0ye2ZpbGw6IzQ0NDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmFycm93czwvdGl0bGU+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjEuNDEgNC42NyAyLjQ4IDMuMTggMy41NCA0LjY3IDEuNDEgNC42NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIzLjU0IDUuMzMgMi40OCA2LjgyIDEuNDEgNS4zMyAzLjU0IDUuMzMiLz48L3N2Zz4=) 100% 50% / 1.6rem no-repeat;
        cursor: pointer;
    `}
    background-color: ${props => props.theme.greyMedium};
`;

const ErrorMessage = styled.div`
    position: absolute;
    top: 105%;
    left: 2rem;
    color: red;
    z-index: 100;
`;

export {
    Container, Field, Image, ErrorMessage,
};

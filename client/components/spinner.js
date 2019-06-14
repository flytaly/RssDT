import React from 'react';
import styled from 'styled-components';
import SpinnerIcon from '../static/spinner.svg';

const StyledSpinner = styled.div`
    width: 2rem;
    animation: spin 1s ease infinite;
    @keyframes spin {
        100% {
            transform:rotate(360deg);
        }
    }
    svg {
        width: 100%;
    }
`;

function Spinner() {
    return (
        <StyledSpinner
            title="loading"
        >
            <SpinnerIcon />
        </StyledSpinner>
    );
}

export default Spinner;

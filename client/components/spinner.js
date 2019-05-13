import React from 'react';
import styled from 'styled-components';
import spinnerIcon from '../static/spinner.svg';

const StyledSpinner = styled.img`
    width: 2rem;
    animation: spin 1s ease infinite;
    @keyframes spin {
        100% {
            transform:rotate(360deg);
        }
    }
`;

function Spinner() {
    return (
        <StyledSpinner
            src={spinnerIcon}
            alt="loading"
        />
    );
}

export default Spinner;

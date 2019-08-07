import React from 'react';
import PropTypes from 'prop-types';
import { StyledDarkHalf } from '../styled/card-half';

import CardHeader from '../card-header';

const LoginCardRight = ({ children }) => (
    <StyledDarkHalf>
        <CardHeader />
        {children}
    </StyledDarkHalf>);

LoginCardRight.propTypes = {
    children: PropTypes.node.isRequired,
};

export default LoginCardRight;

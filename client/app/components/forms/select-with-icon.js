import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Field, IconContainer } from '../styled/form-field';

function Select(props) {
    const [focus, setFocus] = useState(false);
    const { onFocus, onBlur, title, IconSVG } = props;
    return (
        <Container focus={focus} title={title}>
            <IconContainer>
                { IconSVG ? <IconSVG style={{ width: '100%', height: '100%' }} /> : null}
            </IconContainer>
            <Field
                as="select"
                {...props}
                onFocus={(...args) => {
                    setFocus(true);
                    onFocus && onFocus(...args);
                }}
                onBlur={(...args) => {
                    setFocus(false);
                    onBlur && onBlur(...args);
                }}
                aria-label={title}
            />
        </Container>);
}

Select.propTypes = {
    IconSVG: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    title: PropTypes.string,
};

Select.defaultProps = {
    onFocus: null,
    onBlur: null,
    title: '',
    IconSVG: null,
};

export default Select;

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Container, Field, ErrorMessage, IconContainer } from '../styled/form-field';

function Input(props) {
    const [focus, setFocus] = useState(false);
    const inputEl = useRef(null);
    const {
        IconSVG, onFocus, onBlur, error, title, touched,
    } = props;

    const onClick = () => inputEl.current.focus();

    return (
        <Container focus={focus} onClick={onClick} title={title}>
            <IconContainer>
                { IconSVG ? <IconSVG style={{ width: '100%', height: '100%' }} /> : null}
            </IconContainer>
            <Field
                as="input"
                {...props}
                onFocus={(...args) => {
                    setFocus(true);
                    onFocus && onFocus(...args);
                }}
                onBlur={(...args) => {
                    setFocus(false);
                    onBlur && onBlur(...args);
                }}
                ref={inputEl}
                aria-label={title}
            />
            {error && touched ? <ErrorMessage>{error}</ErrorMessage> : null}
        </Container>);
}

Input.propTypes = {
    IconSVG: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    title: PropTypes.string,
    touched: PropTypes.bool,
};

Input.defaultProps = {
    onFocus: null,
    onBlur: null,
    error: '',
    title: '',
    touched: false,
    IconSVG: null,
};

export default Input;

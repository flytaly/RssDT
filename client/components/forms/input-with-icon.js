import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Container, Field, Image, ErrorMessage,
} from '../styled/form-field';

function Input(props) {
    const [focus, setFocus] = useState(false);
    const inputEl = useRef(null);
    const {
        icon, onFocus, onBlur, error, name, title, touched,
    } = props;

    const onClick = () => inputEl.current.focus();

    return (
        <Container focus={focus} onClick={onClick} title={title}>
            <Image src={icon} alt={name} />
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
    icon: PropTypes.string.isRequired,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    touched: PropTypes.bool,
};

Input.defaultProps = {
    onFocus: null,
    onBlur: null,
    error: '',
    title: '',
    touched: false,
};

export default Input;

import React, { useState, useRef } from 'react';
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

export default Input;

import React, { useState, useRef } from 'react';
import {
    Container, Field, Image, ErrorMessage,
} from './styled/form-field';

const icons = {
    email: './static/envelope.svg',
    url: './static/rss-square.svg',
};

function Input(props) {
    const [focus, setFocus] = useState(false);
    const inputEl = useRef(null);
    const {
        type, onFocus, onBlur, error,
    } = props;

    const onClick = () => inputEl.current.focus();

    return (
        <Container focus={focus} onClick={onClick}>
            <Image src={icons[type]} />
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
            />
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </Container>);
}

export default Input;

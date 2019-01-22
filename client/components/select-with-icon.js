import React, { useState, useRef } from 'react';
import { Container, Field, Image } from './styled/form-field';

function Select(props) {
    const [focus, setFocus] = useState(false);
    const selectEl = useRef(null);
    const { onFocus, onBlur } = props;

    const onClick = () => selectEl.current.focus();

    return (
        <Container focus={focus} onClick={onClick}>
            <Image src="/static/clock.svg" />
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
                ref={selectEl}
            />
        </Container>);
}

export default Select;

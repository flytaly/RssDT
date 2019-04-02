import React, { useState } from 'react';
import { Container, Field, Image } from './styled/form-field';

function Select(props) {
    const [focus, setFocus] = useState(false);
    const {
        onFocus, onBlur, name, title,
    } = props;

    return (
        <Container focus={focus}>
            <Image src="/static/clock.svg" alt={name} />
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

export default Select;

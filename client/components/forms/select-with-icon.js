import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Field, Image } from '../styled/form-field';

function Select(props) {
    const [focus, setFocus] = useState(false);
    const {
        onFocus, onBlur, name, title, icon,
    } = props;

    return (
        <Container focus={focus} title={title}>
            <Image src={icon} alt={name} />
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
    icon: PropTypes.string.isRequired,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
};

Select.defaultProps = {
    onFocus: null,
    onBlur: null,
    title: '',
};

export default Select;

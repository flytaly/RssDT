import React, { Component } from 'react';
import Container from './styled/form-element-container';
import Image from './styled/form-element-image';
import FormElement from './styled/form-element';

const icons = {
    email: './static/envelope.svg',
    url: './static/rss-square.svg',
};

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = { focus: false };
        this.textInputRef = React.createRef();
    }

    focusTextInput = () => {
        this.textInputRef.current.focus();
    }

    render() {
        const { type, onFocus, onBlur } = this.props;
        const { focus } = this.state;

        return (
            <Container focus={focus} onClick={this.focusTextInput}>
                <Image src={icons[type]} />
                <FormElement
                    as="input"
                    {...this.props}
                    onFocus={(...args) => {
                        this.setState({ focus: true });
                        onFocus && onFocus(...args);
                    }}
                    onBlur={(...args) => {
                        this.setState({ focus: false });
                        onBlur && onBlur(...args);
                    }}
                    ref={this.textInputRef}
                />
            </Container>);
    }
}


export default Input;

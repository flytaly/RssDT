import React, { Component } from 'react';
import Container from './styled/form-element-container';
import FormElementImage from './styled/form-element-image';
import FormElement from './styled/form-element';

class Select extends Component {
    constructor(props) {
        super(props);
        this.state = { focus: false };
        this.textInputRef = React.createRef();
    }

    focusSelect = () => {
        this.textInputRef.current.focus();
    }

    render() {
        const { onFocus, onBlur } = this.props;
        const { focus } = this.state;
        return (
            <Container focus={focus} onClick={this.focusSelect}>
                <FormElementImage src="/static/clock.svg" />
                <FormElement
                    as="select"
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


export default Select;

import React, { Component } from 'react';
import styled, { withTheme, css } from 'styled-components';

const StyledInputContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 4.5rem;
    max-width: 100%;
    padding: 1rem;
    margin-bottom: 2rem;
    background-color: ${props => props.theme.greyMedium};
    border: ${props => (props.focus
        ? `2px solid ${props.theme.btnColor1}`
        : `1px solid ${props.theme.greyDark}`)};
    border-radius: 30px;
    :hover {
        border-width: 2px;
    }
`;

const InputImage = styled.div`
    width: 2rem;
    height: 2rem;
    ${props => props.img && css`background: center / contain no-repeat url('${props.img}');`}
`;

const StyledInput = styled.input`
    flex: 1 0 auto;
    margin-left: 0.5rem;
    height: 100%;
    font-size: 1.6rem;
    border: none;
    outline: none;
    background-color: ${props => props.theme.greyMedium};
`;

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
            <StyledInputContainer focus={focus} onClick={this.focusTextInput}>
                <InputImage img={icons[type]} />
                <StyledInput
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
            </StyledInputContainer>);
    }
}


export default withTheme(Input);

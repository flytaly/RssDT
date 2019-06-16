import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const checkMark = <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" /></svg>;

const CheckBoxContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: 1rem;
    Label {
        display: flex;
        align-items: center;
    }
    label:first-of-type {
        border: 1px solid ${props => props.theme.fontColor};
        width: 1.7rem;
        height: 1.7rem;
        border-radius: 4px;
        padding: 1px;
        margin-right: 0.5rem;
    }
    label > img {
        margin-right: 0.5rem;
    }
    svg {
        visibility: hidden;
        fill: ${props => props.theme.accentColor1};
    }
    input {
        position: absolute;
        opacity: 0;
    }
    input:checked + label > svg{
        visibility: visible;
    }
    input:focus + label {
        outline: 3px auto ${props => props.theme.accentColor1};
        border-radius: 0;
    }
`;

const Checkbox = ({
    id, title, iconUrl, name, checked, onChangeHandler,
}) => (
    <div>
        <CheckBoxContainer>
            <input id={id} type="checkbox" name={name} checked={checked} onChange={onChangeHandler} />
            <label htmlFor={id} title={title}>
                {checkMark}
            </label>
            <label htmlFor={id}>
                {iconUrl ? <img src={iconUrl} width="16px" alt={title} /> : null}
                {title}
            </label>
        </CheckBoxContainer>
    </div>);

Checkbox.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    iconUrl: PropTypes.string,
    name: PropTypes.string,
    checked: PropTypes.bool,
    onChangeHandler: PropTypes.func,
};
Checkbox.defaultProps = {
    title: '',
    iconUrl: null,
    name: '',
    checked: false,
    onChangeHandler: () => {},
};


export default Checkbox;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyledDarkHalf } from '../styled/card-half';
import LoginForm from './login-form';
import RequestPasswordForm from './request-password-form';
import SetPasswordForm from './set-password-form';
import CardHeader from '../card-header';

const LoginCardRight = (props) => {
    const { form: formType, ...restProps } = props;
    const [form, setForm] = useState(formType);

    const pickForm = (currentForm) => {
        if (currentForm === 'request_password') {
            return <RequestPasswordForm {...restProps} changeForm={() => { setForm('login'); }} />;
        }
        if (currentForm === 'set_password') {
            return <SetPasswordForm {...restProps} />;
        }

        return <LoginForm {...restProps} changeForm={() => { setForm('request_password'); }} />;
    };

    return (
        <StyledDarkHalf>
            <CardHeader />
            {pickForm(form)}
        </StyledDarkHalf>);
};

LoginCardRight.propTypes = {
    form: PropTypes.string,
};
LoginCardRight.defaultProps = {
    form: 'login',
};

export default LoginCardRight;

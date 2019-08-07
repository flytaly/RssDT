import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { WelcomeStyledCard } from '../styled/card';
import CardLeft from './login-left';
import CardRight from './login-right';
import LoginForm from './login-form';
import RequestPasswordForm from './request-password-form';
import SetPasswordForm from './set-password-form';
import formTypes from './form-types';

const LoginCard = ({ form, token }) => {
    const [messages, setMessages] = useState({ error: '', success: '' });

    const pickForm = (currentForm) => {
        if (currentForm === formTypes.request_password) {
            return <RequestPasswordForm setMessages={setMessages} />;
        }
        if (currentForm === formTypes.set_password) {
            return <SetPasswordForm setMessages={setMessages} token={token} />;
        }

        return <LoginForm setMessages={setMessages} />;
    };

    return (
        <WelcomeStyledCard>
            <CardLeft messages={messages} currentForm={form} />
            <CardRight>
                {pickForm(form)}
            </CardRight>
        </WelcomeStyledCard>);
};


LoginCard.propTypes = {
    form: PropTypes.oneOf(Object.keys(formTypes)),
    token: PropTypes.string,
};
LoginCard.defaultProps = {
    token: '',
    form: 'login',
};

export default LoginCard;

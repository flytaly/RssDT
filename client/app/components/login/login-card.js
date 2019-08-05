import React, { useState } from 'react';
import { WelcomeStyledCard } from '../styled/card';
import CardLeft from './login-left';
import CardRight from './login-right';

const LoginCard = (props) => {
    const [messages, setMessages] = useState({ error: '', success: '' });
    return (
        <WelcomeStyledCard>
            <CardLeft messages={messages} />
            <CardRight setMessages={setMessages} {...props} />
        </WelcomeStyledCard>);
};

export default LoginCard;

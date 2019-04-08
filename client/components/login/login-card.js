import React, { useState } from 'react';
import StyledCard from '../styled/card';
import CardLeft from './login-left';
import CardRight from './login-right';

const LoginCard = (props) => {
    const [messages, setMessages] = useState({ error: '', success: '' });
    return (
        <StyledCard>
            <CardLeft messages={messages} />
            <CardRight setMessages={setMessages} {...props} />
        </StyledCard>);
};

export default LoginCard;

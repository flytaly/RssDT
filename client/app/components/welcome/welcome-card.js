import React, { useState } from 'react';
import { WelcomeStyledCard } from '../styled/card';
import CardLeft from './card-left';
import CardRight from './card-right';

const WelcomeCard = () => {
    const [messages, setMessages] = useState({ error: '', success: '' });
    return (
        <WelcomeStyledCard>
            <CardLeft messages={messages} />
            <CardRight setMessages={setMessages} />
        </WelcomeStyledCard>);
};

export default WelcomeCard;

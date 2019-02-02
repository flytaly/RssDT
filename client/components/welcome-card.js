import React, { useState } from 'react';
import StyledCard from './styled/card';
import CardLeft from './card-left';
import CardRight from './card-right';


const WelcomeCard = () => {
    const [messages, setMessages] = useState({ error: '', success: '' });
    return (
        <StyledCard>
            <CardLeft messages={messages} />
            <CardRight setMessages={setMessages} />
        </StyledCard>);
};

export default WelcomeCard;

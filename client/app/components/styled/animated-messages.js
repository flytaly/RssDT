import { useTransition, animated } from 'react-spring';
import styled from 'styled-components';

export const Message = styled(animated.div)`
    display: flex;
    align-items: center;
    font-size: 1.6rem;
    box-shadow: 0rem 5px 10px 0px rgba(0,0,0,0.25);
    border-radius: 5px;
    padding: 1rem;
    margin: 1rem 0;
    will-change: transform, opacity;
    &:hover {
        box-shadow: 0rem 5px 10px 0px rgba(0,0,0,0.35);
    }
    svg {
        height: 1.6em;
        width: 1.6em;
        min-width: 1.6em;
        margin-right: 1rem;
    }
`;

export const MessageLine = styled.div`
    background-color: ${props => props.theme.greyDark};
    height: 100%;
    min-width: 3px;
    margin-right: 1rem;
    border-radius: 10px;
`;

export const ErrorMessage = styled(Message)`
    word-break: break-word;
    border: 1px solid rgb(200, 0, 0);
    color: rgb(200, 0, 0);
    box-shadow: 0rem 5px 5px 0px rgba(200,0,0,0.25);
    &:hover {
        box-shadow: 0rem 5px 5px 0px rgba(200,0,0,0.35);
    }
`;

export const SuccessMessage = styled(Message)`
    word-break: break-word;
    border: 1px solid rgb(0, 128, 0);
    color: rgb(0, 128, 0);
    box-shadow: 0rem 5px 5px 0px rgba(0,128,0,0.25);
    &:hover {
        box-shadow: 0rem 5px 5px 0px rgba(0,128,0,0.35)
    }
`;

export const useEmergeTransition = items => useTransition(items, item => item.key, {
    from: { transform: 'translate3d(0, 100%, 0)', opacity: 0 },
    enter: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    leave: { position: 'absolute' },
});

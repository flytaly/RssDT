/**
 * This is simple implementation of 'redux-like' state manager
 * based on the article: https://medium.com/front-end-weekly/react-hooks-tutorial-for-pure-usereducer-usecontext-for-global-state-like-redux-and-comparison-dd3da5053624
 */
import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

export const initialState = {
    newFeedModal: { isOpen: false },
    isBrowser: false,
};
export const types = {
    toggleNewFeedModal: 'toggleNewFeedModal',
    setIsBrowser: 'setIsBrowser',
};

export const reducer = (state, action) => {
    switch (action.type) {
        case types.toggleNewFeedModal: return {
            ...state,
            newFeedModal: { isOpen: !state.newFeedModal.isOpen },
        };
        case types.setIsBrowser: return {
            ...state,
            isBrowser: true,
        };
        default: return state;
    }
};

export const stateCtx = createContext(initialState);
const dispatchCtx = createContext(() => null);

export const useDispatch = () => useContext(dispatchCtx);

export const useGlobalState = (property = null) => {
    const state = useContext(stateCtx);
    return property ? state[property] : state;
};

export const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <dispatchCtx.Provider value={dispatch}>
            <stateCtx.Provider value={state}>
                {children}
            </stateCtx.Provider>
        </dispatchCtx.Provider>
    );
};

StateProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

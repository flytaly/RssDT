import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useGlobalState, useDispatch, types } from './state';

/**
 * This component is useful for preventing warning: "Text content did not match"
 * caused by toLocaleDateString() and toLocaleString().
 * The functions doesn't work properly in serverless lambdas
 * that don't support nodejs internationalization (full-icu).
 */
const RenderInBrowser = ({ children }) => {
    const isBrowser = useGlobalState('isBrowser');
    const dispatch = useDispatch();
    useEffect(() => {
        if (!isBrowser) dispatch({ type: types.setIsBrowser });
    }, [isBrowser, dispatch]);
    if (isBrowser) return children;
    return <span />;
};

RenderInBrowser.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RenderInBrowser;

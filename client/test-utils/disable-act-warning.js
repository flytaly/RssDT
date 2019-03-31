
/**
 * This is a temporary hack to disable react warning about wrapping in act(...).
 * See issues:
 * https://github.com/facebook/react/issues/14769
 * https://github.com/trojanowski/react-apollo-hooks/issues/84
 */

// TODO: Remove this module from tests after the issues will be closed

const errorOrigin = console.error;

console.error = (...args) => {
    if (args && args[0].startsWith('Warning: An update to %s inside a test was not wrapped')) {
        return;
    }
    errorOrigin.apply(console, args);
};

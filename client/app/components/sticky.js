import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Render props component that pass flag to children when they reach the top of the page
 */
const Sticky = ({ children }) => {
    const barRef = useRef(null);
    const [isOnTop, setIsOnTop] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    entry.boundingClientRect.top <= 0 && !isOnTop && setIsOnTop(true);
                } else {
                    isOnTop && setIsOnTop(false);
                }
            });
        }));
        const bar = barRef.current;

        observer.observe(barRef.current);

        return () => observer.unobserve(bar);
    }, [isOnTop]);

    return (
        <>
            <div ref={barRef} />
            {children(isOnTop)}
        </>);
};

Sticky.propTypes = {
    children: PropTypes.func.isRequired,
};

export default Sticky;

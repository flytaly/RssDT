/* eslint-disable react/no-danger */
import React from 'react';
import { GA_TRACKING_ID } from './gtag';

const LoadGtag = () => {
    /* Global Site Tag (gtag.js) - Google Analytics */
    if (!GA_TRACKING_ID) return null;
    return (
        <>
            <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');`,
                }}
            />
        </>);
};

export default LoadGtag;

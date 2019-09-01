import React from 'react';

export default [
    {
        id: 'about',
        headerText: 'About',
        content: (
            <div>
                FeedMailu aggregates items from RSS or Atom feed, create digest and send them into your email inbox.
            </div>),
    },
    {
        id: 'periods',
        headerText: 'Choosing time and periods',
        content: (
            <div>
                You can choose how often you want to receive digests. If you prefer daily digests you can also pick
                an hour of the digests in the
                {' '}
                <a href="/settings">settings page</a>
                .
                <img src="/static/img/settings-daily-digest-hour.png" alt="daily digest hour" width="315px" />
            </div>),
    },
    {
        id: 'toc',
        headerText: 'Table of content',
        content: (
            <div>
                <img src="/static/img/hacker-news-digest-toc.png" alt="digest table of content" width="80%" />
                    To enable table of content whether go to
                {' '}
                <a href="/settings">settings page</a>
                {' '}
                    and turn on &quot; table of content&quot; option for all feeds
                <img src="/static/img/toc.png" alt="table of content option" width="180px" />
                    or in
                {' '}
                <a href="/feeds/manage">subscription manager</a>
                {' '}
                    click on &quot;edit&quot; icon and enable the option only for a specific feed
                <img src="/static/img/edit-feed-table.png" alt="table of content option" width="432px" />
                <img src="/static/img/toc-per-feed-option.png" alt="table of content option" width="520px" />
            </div>),
    },
    {
        id: 'contacts',
        headerText: 'Contacts',
        content: (
            <div>
                <a href="mailto:support@feedmailu.com">Contact me</a>
                {' '}
                if you have any questions or suggestions.
            </div>),
    },
    {
        id: 'source',
        headerText: 'Source code',
        content: (
            <div><a href="https://github.com/flytaly/feedmailu">Github</a></div>),
    },

];

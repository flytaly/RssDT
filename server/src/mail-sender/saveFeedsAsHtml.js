const fs = require('fs');
const { URL } = require('url');
const db = require('../bind-prisma');
const { composeHTML } = require('./compose-mail');

/** Converts feeds with item to HTML and saves in folder "digest". */
const generateHTML = async () => {
    try {
        const feeds = await db.query.feeds({ last: 10 }, `{
        url
        title
        items {
            id
            title
            description
            summary
            link
            pubDate
            imageUrl
            enclosures {
                url
                type
            }
        }}`);

        for (const [idx, feed] of feeds.entries()) {
            const { html } = composeHTML(feed, feed.items, {
                withContentTable: 'DEFAULT',
                itemBody: 'DEFAULT',
            });
            const dir = `${__dirname}/digests`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            const filename = `${idx}-${new URL(feed.url).hostname}`;
            fs.writeFileSync(`${dir}/${filename}.html`, html);
        }
    } catch (e) {
        console.error(e);
    }
};

generateHTML();

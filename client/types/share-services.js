const share = [{
    id: 'pocket',
    getUrl: url => `https://getpocket.com/edit?url=${encodeURIComponent(url)}`,
    iconUrl: '/static/share/pocket_32.png',
    title: 'Pocket',
}, {
    id: 'evernote',
    getUrl: (url, title) => `http://www.evernote.com/clip.action?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    iconUrl: '/static/share/evernote_32.png',
    title: 'Evernote',
}, {
    id: 'trello',
    getUrl: (url, title) => `https://trello.com/en/add-card?url=${encodeURIComponent(url)}&name=${encodeURIComponent(title)}`,
    iconUrl: '/static/share/trello_32.png',
    title: 'Trello',
}];

module.exports = share;

const fs = require('fs');
const path = require('path');


function readXMLFilesInDir(dir) {
    const files = fs.readdirSync(path.join(__dirname, dir));

    return files
        .filter(x => x.endsWith('.xml'))
        .reduce((acc, currentFile) => {
            const data = fs.readFileSync(path.join(__dirname, dir, currentFile), 'utf-8');

            return { ...acc, [currentFile.slice(0, -4)]: data };
        }, {});
}


const feeds = readXMLFilesInDir('feeds');
const updatedFeeds = readXMLFilesInDir('updated');

module.exports = {
    feeds,
    updatedFeeds,
};

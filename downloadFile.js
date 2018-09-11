const request = require('request');
const fs = require('fs');

module.exports = (src, dest, callback = () => { }) => {
  request(src)
    .pipe(fs.createWriteStream(dest))
    .on('close', callback);
}
const CONFIG = require('../../../hidden_configs');
const fs = require('fs')
const path = require('path');
const res = require('express/lib/response');

module.exports = function(context) {
    const imagePath = path.join('', context.query.file);
    const fileStream = fs.createReadStream(imagePath);
    context.res.writeHead(200, {"Content-Type": "image/jpeg"});
    fileStream.pipe(context.res);
}
// module.exports = serverPoke
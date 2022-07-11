/****************************
 SERVER MAIN FILE
 ****************************/
 require('dotenv').config();
process.env.NODE_ENV = process.env.NODE_ENV;

// Include Modules
let exp = require('express');
let express = require('./configs/express');
let mongoose = require('./configs/mongoose');
let path = require('path');
let helmet = require('helmet')
var https = require('https')
var fs = require('fs')

global.appRoot = path.resolve(__dirname);
global.__base = __dirname + '/';
if (global.permission) {

} else {
    global.permission = [];
}

db = mongoose();
app = express();
app.disable('x-powered-by');
app.use(helmet());

/* Old path for serving public folder */
app.use('/', exp.static(__dirname + '/'));

var server = http.createServer(app);

var options = {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
}

io = require('socket.io')(server, options);
ss = require('socket.io-stream');
require('./configs/commonSocket')(app, io, ss);

server.listen(process.env.SERVER_PORT, () => console.log(`API running on localhost:${process.env.SERVER_PORT}`));
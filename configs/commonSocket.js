
const Globals = require("./Globals");
module.exports = function(app, io, ss) {
    //const MeetingController = require('../app/controllers/MeetingsController.js');
    var connectedUser;
    var rooms;
    var jwt = require('jsonwebtoken');

    io.use(async function(socket, next) {
        try {
            const authenticate = new Globals();
            // console.log("socket.handshake", socket.handshake)
            // console.log("socket.handshake query", socket.handshake.query.auth)
            // console.log("socket.handshake query", socket.handshake.query)
            if(socket.handshake.query && socket.handshake.query.auth){
                var decodeTok = await authenticate.decodeToken(socket.handshake.query.auth);
                if (decodeTok) {
                    console.log("decodeTok", decodeTok)
                    socket.user_id = decodeTok.id;
                    next();
                } else {
                    // console.log("error-----", error)
                    next(new Error('Authentication error 01'));
                }
            }else{
                // console.log("error00", error)
                next(new Error('Authentication error 01'));
            }            
        } catch (error) {
            console.log("error1111", error)
            next(new Error('Authentication error'));
        }
    });


    var chat = io.of('/').on('connection', function(socket) {
        console.log('socket is connected*********************');
        if (socket.connected) {
            console.log('socket is connected.');
            //console.log('connection',socket.handshake.auth, socket.id);
            console.log('connection', socket.user_id);
            socket.roomId = String(socket.user_id)
            socket.join(socket.roomId);
            require(__base + 'app/controllers/connect')(app, io, socket);
        }

        // const meetingObj = (new MeetingController(socket)).boot();
        // meetingObj.updateMeetingById();
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

    });
    return chat;

};
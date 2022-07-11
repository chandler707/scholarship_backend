module.exports = function(app, io, socket) {
    const _ = require("lodash");
    const ObjectId = require('mongodb').ObjectID;
    const Email = require('../services/Email');
    const Users = require('../models/UserSchema').Users;
    const config = require("../../configs/configs");
    const Globals = require("../../configs/Globals");
    const PostsController = require('./PostsController');
    const ReelsController = require('./ReelsController');

    var roomno = 1;
    socket.on('socket:connect', (data) => {
        // socket.notyroom = String(uid);
        // //console.log("notyroom",uid)
        // //socket.join(socket.notyroom);
        // socket.join(socket.notyroom, () => {
        //     let rooms = Object.keys(socket.rooms);
        //     ////console.log(rooms); // [ <socket.id>, 'room 237' ]
        // });
        // socket.emit('socket:connect', {
        //     msg: 'server user connected !'
        // });
        // var soc = io.sockets.connected[socket.id];
        // soc.join(chatRoom);

        // //console.log("data",data)

        socket.room = String(data.user_id + data.company_id);
        console.log("socket user_id",data.user_id)
        socket.join(data.user_id);
        socket.join(socket.room);
        if (data.company_id) {
            socket.join(data.company_id);
        }
        ////console.log(room)
        ////console.log("room",io.sockets.adapter.rooms[room]);
        //s//ocket.join("room-"+room);
        //socket.join(room);

        //var room = "abc123";  
        //io.sockets.in("room-"+room).emit('message', 'what is going on, party people? room-'+roomno);
    });

    //*****************************Post*************************************** */

    socket.on('add:comment', (data, fn) => {
        try {
            const postObj = new PostsController();
            data['user_id'] = socket.user_id;
            // console.log("add:comment", data)
            fn({ status: 1, message: 'Comment added sucessfully' })
            return postObj.addCommentOnPost(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:comment',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('add:reply:comment', (data, fn) => {
        try {
            const postObj = new PostsController();
            data['user_id'] = socket.user_id;
            fn({ status: 1, message: 'Comment added sucessfully' })
            return postObj.replyOnComment(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:reply:comment',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('add:like:comment', (data, fn) => {
        try {
        	console.log("*****************", data, socket.user_id)
            const postObj = new PostsController();
            data['user_id'] = socket.user_id;
            data['likes'] = true;
            fn({ status: 1, message: 'Like added sucessfully' })
            socket.broadcast.emit('add:comment:client', data);
            return postObj.likeUnlikeComment(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:like',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('remove:like:comment', (data, fn) => {
        try {
            const postObj = new PostsController();
            data['user_id'] = socket.user_id;
            data['likes'] = false;
            fn({ status: 1, message: 'UnLike sucessfully' });
            socket.broadcast.emit('remove:comment:client', data);
            return postObj.likeUnlikeComment(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'remove:like',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }        
    });

    socket.on('add:like', (data, fn) => {
        try {
        	console.log("*****************", data, socket.user_id)
            const postObj = new PostsController();
            data['user_id'] = socket.user_id;
            data['likes'] = true;
            fn({ status: 1, message: 'Like added sucessfully' })
            socket.broadcast.emit('add:like:client', data);
            return postObj.likeUnlikePost(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:like',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('remove:like', (data, fn) => {
        try {
            const postObj = new PostsController();
            data['user_id'] = socket.user_id;
            data['likes'] = false;
            fn({ status: 1, message: 'UnLike sucessfully' })
            socket.broadcast.emit('remove:like:client', data);
            return postObj.likeUnlikePost(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'remove:like',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }        
    });

    //************************************************************************* */

    //*****************************Reels*************************************** */

    socket.on('add:comment:reel', (data, fn) => {
        try {
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            fn({ status: 1, message: 'Comment added sucessfully' })
            return reelObj.addCommentOnReel(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:comment:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('add:reply:comment:reel', (data, fn) => {
        try {
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            fn({ status: 1, message: 'Comment added sucessfully' })
            return postObj.replyOnReelComment(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:reply:comment:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('add:like:comment:reel', (data, fn) => {
        try {
        	console.log("*****************", data, socket.user_id)
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            data['likes'] = true;
            fn({ status: 1, message: 'Like added sucessfully' })
            // socket.broadcast.emit('add:comment:client', data);
            return reelObj.likeUnlikeReelComment(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:like:comment:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('remove:like:comment:reel', (data, fn) => {
        try {
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            data['likes'] = false;
            fn({ status: 1, message: 'UnLike sucessfully' });
            // socket.broadcast.emit('remove:comment:client', data);
            return reelObj.likeUnlikeReelComment(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'remove:like:comment:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }        
    });

    socket.on('add:like:reel', (data, fn) => {
        try {
        	console.log("*****************", data, socket.user_id)
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            data['likes'] = true;
            fn({ status: 1, message: 'Like added sucessfully' })
            // socket.broadcast.emit('add:like:client', data);
            return reelObj.likeUnlikeReel(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'add:like:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    });

    socket.on('remove:like:reel', (data, fn) => {
        try {
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            data['likes'] = false;
            fn({ status: 1, message: 'UnLike sucessfully' })
            // socket.broadcast.emit('remove:like:client', data);
            return reelObj.likeUnlikeReel(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'remove:like:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }        
    }); 

    //************************************************************************** */

    socket.on('add:video:view', (data, fn) => {
        try {
            const reelObj = new ReelsController();
            data['user_id'] = socket.user_id;
            fn({ status: 1, message: 'count added' })
            // socket.broadcast.emit('remove:like:client', data);
            return reelObj.addVideoView(data);
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Socket',
                finction_name: 'remove:like:reel',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }        
    }); 


    // socket.on('send:message', (data) => {
    //     try{

        
    //     //console.log('1111111111 send:message')
    //     // _.forEach(data.receaver,function(rec){
    //     //     socket.broadcast.to(rec).emit('meeting:data', { data: data.body_msg });
    //     // });
    //     //io.sockets.in(data.room).emit('meeting:data', { data: data.body_msg });
    //     var objId = ObjectId();
    //     //console.log("data", data)
    //     data['_id'] = objId;
    //     socket.broadcast.to(data.room).emit('chat:data', data);
    //     socket.broadcast.to(data.room).emit('global:notify', data);
        
    //     var chatData = new Messages({
    //             _id: objId,
    //             conversation_id: data.conversation_id,
    //             sender: data.sender,
    //             jobpost_id: data.jobId,
    //             body_msg: data.body_msg,
    //             cand: data.cand_id,
    //             fullname: data.fullname,
    //             user_photo: data.user_photo,
    //             read_status: 'unread',
    //             read_data: data.read_data
    //         });  

    //     chatData.save(function(err, cdata) {
    //         if (err) {
    //             //console.log('err in chat in connect')
    //         } else { 

    //             //console.log('data', data)

    //             // _.forEach(data.read_data,function(i){
    //             //     var commentReadsData = new CommentRead({
    //             //         message_id: ObjectId(cdata._id),
    //             //         user_id : ObjectId(i._id),
    //             //         read_status: i.read_status
    //             //     }); 
    //             //     commentReadsData.save(function(err, data) {
    //             //         if (err) {
    //             //             //console.log('err in chat in connect')
    //             //         } else { 

    //             //         }
    //             //     }); 

    //             // });

    //         }
    //     });

    //     }catch(error){
    //         console.log("error", error)
    //     }


        
    // });

    // socket.on('leave:room', (room) => {
    //     socket.leave(room);
    // });

    // function saveNotification(data){       

    //     var NotofyData = new Notifications({
    //             sender: data._id,
    //             receiver: data.room || data.employer_id,
    //             body_msg: data.web_title,
    //             sender_photo: data.user_photo,
    //             notify_type: data.noty_type,
    //             job_id: data.jobId,
    //             summery:data,
    //             job_title:data.job_title || null,
    //             read_status: 'unread',
    //             company_id: data.company_id
    //         });  

    //     NotofyData.save(function(err, data) {
    //         if (err) {
    //             //console.log('err in save noti in DB')
    //         } else {                
    //             //console.log('data')
    //         }
    //     });

    // }

    // function sendEmailNotify(data, itself){
    //         let emailObj = new Email();
    //         let filter  = '';

    //         //console.log('itself', itself)

    //         if(itself){
    //             filter = { "user_company_name": ObjectId(data.room) };

    //         }else{
    //             filter = { 
    //                 "$and": [
    //                             { "user_company_name": ObjectId(data.room) },
    //                             {"_id": {$ne: ObjectId(data._id)} }
    //                         ]
                    
    //             }
    //         }
        
            
    //         const userData = Users.find(filter, {"user_email":1})

    //         ////console.log("Users", userData)
    //         userData.exec(function(err, users) {
    //             if(err){
    //                 //console.log("err")
    //             }else{
    //                 //console.log("users", users)
    //                 _.forEach(users,function(val){
    //                     var semail = val.user_email;               
    //                     //const sendingMail = emailObj.JobBoard(semail, data);
    //                 });
    //             }

    //         });

    // }

};
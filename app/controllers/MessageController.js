const Controller = require("./Controller");
// import Controller from './Controller';
const ObjectId = require('mongodb').ObjectID;
const configs = require("../../configs/configs");
const _ = require("lodash");
const Users = require('../models/UserSchema').Users;
const Chats = require('../models/chatSchema').Chats;
const ChatDetails = require('../models/chatDetailsSchema').ChatDetails;
const Model = require("../models/Model");
const User = require("../models/User");
const Follwers = require('../models/FollowerSchema').Follwers;
const Notifications = require('../models/NotificationSchema').Notifications;
const Globals = require("../../configs/Globals");
const Email = require('../services/Email');
let Form = require("../services/Form");
let File = require("../services/File");


var redirectUri = 'http://localhost:4099/api/handleAuth';

var accesstoken = '11058696711.c191642.afb1fbf1db0e4ab39d06105f80c5cf65';
class MessageController extends Controller {

    constructor() {
        super();
    }


    async searchConnector() {
        let _this = this;
        let filter = '';
        try {


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async addConnectorInThread() {
        let _this = this;
        let filter = '';
        try {


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async searchMessage() {
        let _this = this;
        let filter = '';
        try {


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async loadChatsByUserId() {
        let _this = this;
        let filter = '';
        try {

            if (!_this.req.body.user_id)
                return this.res.send({ status: 0, message: 'Please send proper data.' });

            filter = {
                "$and": [
                    { 
                        $or : [ 
                                 { "user_id": ObjectId(_this.req.body.user_id) },
                                 { "connector_id": ObjectId(_this.req.body.user_id) }
                            ]
                    },
                    { "delete_status": false }
                ]
            };


            // let threadData = await new Model(Chats).find(filter);
            // //console.log(threadData)
            // if (_.isEmpty(threadData)) {
            //     _this.res.send({ status: 0, message: "No thread available" });
            // } else {
            //     _this.res.send({ status: 1, data: threadData });
            // }

            let skip = (_this.req.body.page - 1) * (_this.req.body.pagesize);
            let sort = { createdAt: 1 };
            if (_this.req.body.sort) {
                sort = _this.req.body.sort;
            }
            let f = [];
            //let filter1 = {};
            if (_this.req.body.filter) {
                let ar = _this.req.body.filter;

                for (let key in ar) {
                    let k = ar[key];
                    let v = [];
                    k.filter((value) => {
                        v.push({
                            [key]: value.toString().toLowerCase()
                        });
                    });
                    f.push({ $or: v })
                }

                filter = { $and: f }
            }

            const threadData = await (new User(Chats)).getThreadsListByUserId(filter, { "updatedAt": -1 }, skip, _this.req.body.pagesize);
            //const threadData = await Trendings.find();

            //console.log(threadData.length)
            if (_.isEmpty(threadData)) {
                return _this.res.send({ status: 2, message: "Trends not available" });
            }

            _this.res.send({ status: 1, data: threadData })



        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async deleteThreadByThreadId() {
        let _this = this;
        let filter = '';
        try {

            if (!_this.req.body.ids)
                return this.res.send({ status: 0, message: 'Please send proper data.' });
            let threadIds = [];

            _this.req.body.ids.filter((i) => {
                threadIds.push(ObjectId(i));
            });
            let filter = { _id: { $in: threadIds } }
            //
            console.log(filter);
            const threadData = await new Model(Chats).newUpdate(filter, { $set: { deletestatus: true } });
            //let threadData = await Chats.findByIdAndUpdate(_this.req.body.thread_id, { "delete_status": true })
            //console.log(threadData)
            if (_.isEmpty(threadData)) {
                _this.res.send({ status: 0, message: "Invalid thread id" });
            } else {
                _this.res.send({ status: 1, data: "Thread deleted sucessfully" });
            }

        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async loadAllMessage() {
        let _this = this;
        let filter = '';
        try {
            console.log(_this.req.body.thread_id)
            if (!_this.req.body.thread_id) {
                return _this.res.send({ status: 0, message: "Please send proper data" });
            }

            
                filter = { "thread_id": ObjectId(_this.req.body.thread_id) };

            let skip = (_this.req.body.page - 1) * (_this.req.body.pagesize);
            let sort = { createdAt: 1 };
            if (_this.req.body.sort) {
                sort = _this.req.body.sort;
            }
            let f = [];
            //let filter1 = {};
            if (_this.req.body.filter) {
                let ar = _this.req.body.filter;

                for (let key in ar) {
                    let k = ar[key];
                    let v = [];
                    k.filter((value) => {
                        v.push({
                            [key]: value.toString().toLowerCase()
                        });
                    });
                    f.push({ $or: v })
                }

                filter = { $and: f }
            }

            const ChatDetailsList = await (new User(ChatDetails)).getMessageListBythreaId(filter, { "createdAt": -1 }, skip, _this.req.body.pagesize);
            //console.log(allfeeds.length)
            //const allfeeds = await playedTracks.find(filter).populate('users', ['user_id']).sort({"createdAt":-1});
            if (_.isEmpty(ChatDetailsList)) {
                return _this.res.send({ status: 2, message: "Chat not available" });
            }

            _this.readAllMessage(_this.req.body.thread_id, _this.req.body.user_id)
             const total = await (new User(ChatDetails)).getCountMessageListBythreaId(filter);
            //_this.res.send({ status: 1, data: ChatDetailsList, total })
            console.log("total",total)
            _this.res.send({
                status: 1,
                message: 'Conversation list',
                data: ChatDetailsList,
                page: _this.req.body.page,
                perPage: _this.req.body.pagesize,
                total: total[0].totalCount
            });

        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async getFollowersListByUser() {
        let _this = this;
        let filter = '';
        try {
            //console.log(_this.req.body)
             if (!_this.req.body.user_id) {
                return _this.res.send({ status: 0, message: "Please send proper data" });
            }
            //check emailId is exist or not

            filter = { "followed_id": ObjectId(_this.req.body.user_id) };

            //const user = await Follwers.find(filter).populate('users', ['followed_by']);

            const user = await (new User(Follwers)).getFollowerListing(filter, { "createdAt": -1 },50);

            if (_.isEmpty(user)) {
                _this.res.send({ status: 0, message: 'No Followers'})
            }else{
                 _this.res.send({ status: 1, data: user })
            }


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async getFollowingListByUser() {
        let _this = this;
        let filter = '';
        try {
            //console.log(_this.req.body)
             if (!_this.req.body.user_id) {
                return _this.res.send({ status: 0, message: "Please send proper data" });
            }
            //check emailId is exist or not

            filter = { "followed_by": ObjectId(_this.req.body.user_id) };

            //const user = await Follwers.find(filter).populate('users', ['followed_by']);

            const user = await (new User(Follwers)).getFollowingListing(filter, { "createdAt": -1 },50);

            if (_.isEmpty(user)) {
                _this.res.send({ status: 0, message: 'No Following'})
            }else{
                 _this.res.send({ status: 1, data: user })
            }


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async searchByPerson() {
        let _this = this;
        let filter = '';
        try {
           // console.log(_this.req.body)
             if (!_this.req.body.id || !_this.req.body.search_text) {
                return _this.res.send({ status: 0, message: "Please send proper data" });
            }


            filter = { "followed_id": ObjectId(_this.req.body.id) };
            //let filter = {"title": {"$regex": _this.req.body.title, "$options": "i"}};

            //const user = await Follwers.find(filter).populate('users', ['followed_by']);

            const user = await (new User(Follwers)).searchPerson(filter, { "createdAt": -1 },50, _this.req.body.search_text);

            if (_.isEmpty(user)) {
                _this.res.send({ status: 0, message: 'No Following'})
            }else{
                 _this.res.send({ status: 1, data: user })
            }


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async searchAnyPerson() {
        let _this = this;
        let filter = '';
        try {
           console.log(_this.req.body)
             if (!_this.req.body.id || !_this.req.body.search_text) {
                return _this.res.send({ status: 0, message: "Please send proper data" });
            }


            if(_this.req.body.search_text === "ALLUSER"){
                filter = {};
            }else{
               filter = {"user_fullname": {"$regex": _this.req.body.search_text, "$options": "i"}}
            }


            
            //let filter = {"title": {"$regex": _this.req.body.title, "$options": "i"}};

            //const user = await Follwers.find(filter).populate('users', ['followed_by']);

            const user = await (new User(Users)).searchAnyPerson(filter, { "createdAt": -1 },50, ObjectId(_this.req.body.id));
            //console.log("user", user)
            if (_.isEmpty(user)) {
                _this.res.send({ status: 0, message: 'No Following'})
            }else{
                 _this.res.send({ status: 1, data: user })
            }


        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async sendMessage() {
        let _this = this;
        let filter = '';
        try {

            const playedTrack = await new Model(Chats).store(_this.req.body);
        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async loadNotificationByUser(){
        let _this = this;
        let filter = '';
        try {

            console.log("_this.req.body", _this.req.body)

            if (!_this.req.body.user_id) {
                return _this.res.send({ status: 0, message: "Please send proper data" });
            }            
            //filter = { "receiver_id": ObjectId(_this.req.body.user_id) };

            filter = {
                "$and": [
                    { "receiver_id": ObjectId(_this.req.body.user_id)},
                    { "deletestatus": false },
                    { "read_status": "unread" },
                ]
            };

            let skip = (_this.req.body.page - 1) * (_this.req.body.pagesize);
            let sort = { createdAt: 1 };
            if (_this.req.body.sort) {
                sort = _this.req.body.sort;
            }
            let f = [];
            //let filter1 = {};
            if (_this.req.body.filter) {
                let ar = _this.req.body.filter;

                for (let key in ar) {
                    let k = ar[key];
                    let v = [];
                    k.filter((value) => {
                        v.push({
                            [key]: value.toString().toLowerCase()
                        });
                    });
                    f.push({ $or: v })
                }

                filter = { $and: f }
            }

            const NotifList = await (new User(Notifications)).getNotificationByUserId(filter, { "createdAt": -1 }, skip, _this.req.body.pagesize);
            //console.log(allfeeds.length)
            //const allfeeds = await playedTracks.find(filter).populate('users', ['user_id']).sort({"createdAt":-1});
            if (_.isEmpty(NotifList)) {
                return _this.res.send({ status: 2, message: "Notification not available" });
            }

            const total = await (new User(Notifications)).getCountNotificationByUserId(filter);
            //_this.res.send({ status: 1, data: ChatDetailsList, total })
            _this.res.send({
                status: 1,
                message: 'Notification list',
                data: NotifList,
                page: _this.req.body.page,
                perPage: _this.req.body.pagesize,
                total: total[0].totalCount
            });

        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async deleteNotificationById() {
        let _this = this;
        let filter = '';
        try {

            if (!_this.req.body.ids)
                return this.res.send({ status: 0, message: 'Please send proper data.' });

            let userIds = [];

            _this.req.body.ids.filter((i) => {
                userIds.push(ObjectId(i));
            });
            let filter = { _id: { $in: userIds } }
            //
            console.log(filter);
            const threadData = await new Model(Notifications).newUpdate(filter, { $set: { deletestatus: true } });
            //let threadData = await Notifications.findByIdAndUpdate(_this.req.body.id, { "deletestatus": true })
            //console.log(threadData)
            if (_.isEmpty(threadData)) {
                _this.res.send({ status: 0, message: "Invalid notification id" });
            } else {
                _this.res.send({ status: 1, data: "Notification deleted sucessfully" });
            }

        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async readNotificationById() {
        let _this = this;
        let filter = '';
        try {

            if (!_this.req.body.id)
                return this.res.send({ status: 0, message: 'Please send proper data.' });

            let filter = { _id: _this.req.body.id }
            //
            console.log(filter);
            //const threadData = await new Model(Notifications).newUpdate(filter, { $set: { deletestatus: true } });
            let threadData = await Notifications.findByIdAndUpdate(_this.req.body.id, { "read_status": "read" }, { new: true })
            //console.log(threadData)
            if (_.isEmpty(threadData)) {
                _this.res.send({ status: 0, message: "Invalid notification id" });
            } else {
                _this.res.send({ status: 1, data: "Notification updatet sucessfully" });
            }

        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

    async getThreadId(){
        let _this = this;
        let filter = ''; 
        try{
            console.log("body",_this.req.body)
            if (!_this.req.body.rec_id && !_this.req.body.sender_id )
                return this.res.send({ status: 0, message: 'Please send proper data.' });

            filter = {
                    $or: [
                            { $and : [ { "user_id": _this.req.body.rec_id, "connector_id" :  _this.req.body.sender_id } ] },
                            { $and : [ {"user_id" : _this.req.body.sender_id , "connector_id" : _this.req.body.rec_id  } ] }
                          ]
                };
            let thredsData = await new Model(Chats).findOne(filter);
            //console.log("thr id", thredsData[0]._id)
            if (_.isEmpty(thredsData)) {
                _this.res.send({ status: 0, message: "Thread are not available" });
            } else {
                _this.res.send({ status: 1, data: thredsData[0] });
            }


        }catch(error){
            console.log(error)
        }
    }

    async msgTest() {
        let _this = this;
        let filter = '';
        try {

            const playedTrack = await new Model(Chats).store(_this.req.body);
        } catch (error) {
            console.log("error", error)
            _this.res.send({ status: 0, message: error });
        }
    }

   

    readAllMessage(thredId, receiverId){
        try{
            console.log(thredId, receiverId)
            var filter = {
                "$and": [
                    { "thread_id": ObjectId(thredId) },
                    { "receiver_id": ObjectId(receiverId) }
                ]
            };

            const UsersData = ChatDetails.updateMany(filter, { $set: { "flag_status": "read" } })

            //console.log("Users", userData)
            UsersData.exec(function(err, Chats) {
                if (err) {
                    console.log(err)
                    return false
                } else {
                    console.log("user socket update", Chats)
                    return true
                }

            });

        }catch(error){
            console.log('error', error)
        }
    }


}
module.exports = MessageController;
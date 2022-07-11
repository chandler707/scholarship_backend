/****************************
 PUSH NOTIFICATIONS OPERATIONS
 ****************************/
let path = require('path');
let fs = require('fs');
let _ = require("lodash");
// const Notifications = require('../models/NotificationSchema').Notifications;
const ObjectId = require('mongodb').ObjectID;
var FCM = require('fcm-node');
const { Users } = require('../models/UserSchema');
const Notifications = require('../models/NotificationSchema').Notifications;
const Posts = require('../models/PostsSchema').Posts;
const Model = require("../models/Model");
var serverKey = process.env.FIREBASE_SERVER_KEY;
var fcm = new FCM(serverKey);


class PushNotification {

    constructor() {
    }

    async saveNotification(data) {
        try {
            return new Promise(async (resolve, reject) => {
                //////////console.log('data', data)
                var notofyData = {
                    body_msg: data.body_msg,
                    title: data.title,
                    notify_type: data.notify_type,
                    user_id: data.user_id,
                    post_id: data.post_id,
                    post_user_id: data.post_user_id,
                    target_screen: data.target_screen,
                    read_status: 'unread',
                    deletestatus: false
                };
                // var datass = await Notifications.findOneAndUpdate({ user_id: notofyData.user_id }, notofyData, { upsert: true, new: true });
                var datass = await new Model(Notifications).store(notofyData);
                return resolve(datass)
            });
        } catch (error) {
            console.log('saveNotification error', error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'Transaction Route Api',
                finction_name: 'saveNotification',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
        }

    }

    //Send push notification    
    send(data, type) {
        var _this = this;
        try {
            return new Promise(async (resolve, reject) => {
                // console.log("111111111111", data)
                if (!data.post_user_id) {
                    return resolve({ status: 1, message: "Push noticatioon not sent" });
                }

                var thumbnail = null;

                
                const loginUserData = await Users.findOne({ "_id": ObjectId(data.user_id) }, { "user_photo": 1, "user_fullname":1});
                const userData = await Users.findOne({ "_id": ObjectId(data.post_user_id) }, { "device_token": 1, "push_notification_status": 1, "comment_notification_status": 1, "like_notification_status": 1, "follow_notification_status": 1 });

                if(data.notify_type != 'user_follow'){
                    const postData = await Posts.findOne({ "_id": ObjectId(data.post_id) }, { "thumbnail": 1});
                    thumbnail = postData.thumbnail;
                    data['thumbnail'] = postData.thumbnail; 
                }
                              
                data['user_photo'] = loginUserData.user_photo;
                var notiData = await _this.saveNotification(data);
                data['noti_id'] = notiData._id;
                
                data['body_msg'] = `${loginUserData.user_fullname} ${data.body_msg}`;
                data['title'] = `${loginUserData.user_fullname} ${data.title}`;

                // console.log("userData**", userData)

                if (!userData.push_notification_status) {
                    return resolve({ status: 1, message: "Push noticatioon not sent" });
                }

                if (data.notify_type == 'comment_post' && !userData.comment_notification_status)
                    return resolve({ status: 1, message: "Push noticatioon not sent" });

                if (data.notify_type == 'user_follow' && !userData.follow_notification_status)
                    return resolve({ status: 1, message: "Push noticatioon not sent" });

                if (data.notify_type == 'like_post' && !userData.like_notification_status)
                    return resolve({ status: 1, message: "Push noticatioon not sent" });

                var token = userData.device_token || data.token || null;

                // console.log("token", token)

                var os_type = data.os_type || 'ios';
                var body_msg = data.body_msg;
                var noti_id = data.noti_id;

                if (token && token.length > 10) {

                    var message = {
                        "content_available": true,
                        "priority": "high",
                        "show_in_foreground": true,
                        to: token,
                        notification: {
                            sound: "default",
                            title: data.title,
                            body: body_msg
                        },
                        data: {
                            title: data.title,
                            targetScreen: data.target_screen,
                            image: thumbnail || loginUserData.user_photo,
                            notification_id: noti_id,
                            is_open: 0,
                            type: "alert",
                            os_type: os_type
                        }
                    };
                    // console.log("message", message)

                    fcm.send(message, function (err, response) {
                        console.log("err1111", err, response)
                        if (err) {
                            return reject({ status: 0, message: "Push noticatioon server error" });
                        } else {
                            _this.updateNotificationStatus(noti_id, type)
                            return resolve({ status: 1, message: "Push noticatioon sent" });
                        }
                    });
                }else{
                    return resolve({ status: 1, message: "Push noticatioon not sent" });
                }

            });
        } catch (err) {
            console.log("Push Notification error", err);
        }
    }

    sendAndroid(data) {
        return new Promise(async (resolve, reject) => {
            // //console.log(regTokens);
            //console.log(data);

            const userData = await Users.findOne({ "_id": ObjectId(data.post_user_id) });

            // var serverKey = 'AAAA_eOA8VM:APA91bEeYePc0j0QaF92qj7RaS_x2U2V0fGfHmB7kRyrwkuD05rCzTldOaP6kCt5F0JN9zCe8MNc0oCVqwJfVcn0BL-LHf-WWkx8fTAxHzxALbqKxPVAMW2_VqWYVEo9Pej8zEr1Aq3i'; //put your server key here
            var fcm = new FCM(serverKey);
            var token = userData.device_token || data.token || null;
            var body_msg = data.body_msg;

            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: token,
                collapse_key: 'AIzaSyBfTByKokfpC99MFGAtSjqDTsPla_iwewE',

                notification: {
                    title: data.title,
                    body: body_msg

                },

                data: {  //you can send only notification or only data(or include both)
                    data: data
                }
            };
            //console.log(message);
            fcm.send(message, function (err, response) {
                if (err) {

                    //console.log("Something has gone wrong!", err);
                    reject(err);
                } else {
                    resolve(response);
                    //console.log("Successfully sent with response: ", response);
                }
            });

        })
    }

    async updateNotificationStatus(noti_id, type) {
        try {
            var dataObj = {};

            if (type == 'per20') {
                dataObj = { "per20_status": true }

            } else if (type == 'per50') {
                dataObj = { "per50_status": true }

            } else if (type == 'per80') {
                dataObj = { "per80_status": true }

            } else if (type == '2hr_appoint') {
                dataObj = { "hr2_status": true }

            } else if (type == '24hr_appoint') {
                dataObj = { "hr24_status": true }

            } else if (type == 'clinic_not_book') {
                dataObj = { "clinic_not_book": true }

            } else if (type == '1hr_appoint') {
                dataObj = { "hr1_status": true }
            }

            var ddd = await Notifications.findByIdAndUpdate(ObjectId(noti_id), dataObj, { new: true });
            ////console.log("ddd", ddd)
        } catch (error) {
            //console.log("error", error)
        }
    }

    sendTest(data) {
        var _this = this;
        try {
            return new Promise(async (resolve, reject) => {
                ////console.log("111111111111", data)
                var token = data.token || null;
                var msg = data.body_msg || null;
                if (token && token.length > 10) {

                    var message = {
                        "content_available": true,
                        "priority": "high",
                        "show_in_foreground": true,
                        to: token,
                        notification: {
                            sound: "default",
                            title: data.title,
                            body: msg
                        },
                        data: {
                            title: data.title,
                            is_open: 0,
                            type: "alert",
                        }
                    };
                    ////console.log("message", message)

                    fcm.send(message, function (err, response) {
                        //console.log("err1111", err, response)
                        if (err) {
                            return reject({ status: 0, message: "Push noticatioon server error" });
                        } else {
                            return resolve({ status: 1, message: "Push noticatioon sent" });
                        }
                    });
                }

            });
        } catch (err) {
            //console.log("Push Notification error", err);
        }
    }

}

module.exports = PushNotification;
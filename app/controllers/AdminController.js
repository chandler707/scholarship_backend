const Controller = require('./Controller');
const _ = require('lodash');
//const csvjson = require('csvjson');
const ObjectId = require('mongodb').ObjectID;
const Globals = require('../../configs/Globals');
const Users = require('../models/UserSchema').Users;
const Model = require("../models/Model");
const User = require("../models/User");
const langEn = require("../../configs/en");
const bcrypt = require('bcrypt');
const Authtokens = require('../models/AuthenticationSchema').Authtokens;
let Form = require("../services/Form");
let File = require("../services/File");
const Email = require('../services/Email');
var asyncProcess = require("async");
const fs = require('fs');
var atob = require('atob');
var https = require('https');
const crypto = require('crypto');
const { base64encode, base64decode } = require('nodejs-base64');
var md5 = require('md5');
// const PushNotification = require("../services/PushNotification");
// let NotificationObj = new PushNotification();
// const Notifications = require('../models/NotificationSchema').Notifications;
//var gifify = require('gifify');


class AdminController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
     Purpose: admin login
     Parameter:
     {
        "email": "5ad5d198f657ca54cfe39ba0"
        "password": "5ad5d198f657ca54cfe39ba0"
     }
     Return: JSON String
     ********************************************************/
    async adminLogin() {

        let _this = this;

        if (!this.req.body.email || !this.req.body.password)
            return this.res.send({ status: 0, message: 'Please send proper data.' });

        try {
            let filter = { user_email: this.req.body.email };
            const admin = await Users.findOne(filter);
            if (_.isEmpty(admin))
                return this.res.send({ status: 0, message: 'Admin not found.' });
            const status = await bcrypt.compare(_this.req.body.password, admin.user_password)

            if (!status)
                return _this.res.send({ status: 0, message: 'Authentication Failed, Invalid Password.' });

            //var tokelDelMany = await Authtokens.deleteMany({"userId":ObjectId(admin._id)});
            
            let globalObj = new Globals();
            const token = await globalObj.getToken(admin._id);

            let data = {
                _id: admin._id,
                firstname: admin.user_firstname,
                lastname: admin.user_lastname,
                email: admin.user_email,
                clinic_id: admin.clinic_id || null,
                //fullname: _this.getFullName(admin.user_firstname, admin.user_lastname),
                photo: admin.user_photo,
                mobile: admin.user_phone,
                company_name: admin.user_company_name,
                role: admin.user_role,
            }

            _this.res.send({ status: 1, message: "Logged in successfully.", access_token: token, data: data });
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'adminLogin',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async profile() {
        let _this = this;
        try {
            var uid = atob(atob(atob(atob(atob(_this.req.body.uid)))));
            const admin = await (new Model(Users)).findOne({ _id: uid }, { user_email: 1, user_firstname: 1, user_lastname: 1, user_photo: 1, user_phone: 1, user_company_name: 1 });
            if (_.isEmpty(admin))
                return _this.res.send({ status: 0, message: 'User not found' });
            _this.res.send({ status: 1, message: 'User found', data: admin[0] });
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'profile',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async checkSession(){
        let _this = this;
        try {

            console.log("userId Admin", _this.req.user.userId)
            _this.res.send({ status: 1, message: 'Session checked' });
            // var uid = atob(atob(atob(atob(atob(_this.req.body.uid)))));
            // const admin = await (new Model(Users)).findOne({ _id: uid }, { user_email: 1, user_firstname: 1, user_lastname: 1, user_photo: 1, user_phone: 1, user_company_name: 1 });
            // if (_.isEmpty(admin))
            //     return _this.res.send({ status: 0, message: 'User not found' });
            // _this.res.send({ status: 1, message: 'User found', data: admin[0] });
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'profile',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async updateAdmin() {
        let _this = this;
        let filepath;

        let form = new Form(_this.req);
        let formObject = await form.parse();
        _this.req.body = formObject.fields;

        ////console.log(formObject)

        var dataObj = {
            uid: (_this.req.body.uid[0].length > 0) ? _this.req.body.uid[0] : null,
            user_firstname: (_this.req.body.fname[0].length > 0) ? _this.req.body.fname[0] : null,
            user_lastname: (_this.req.body.lname[0].length > 0) ? _this.req.body.lname[0] : null,
            user_phone: (_this.req.body.phone[0].length > 0) ? _this.req.body.phone[0] : null,
            user_fullname: _this.getFullName(_this.req.body.fname[0], _this.req.body.lname[0])
        }

        if (formObject.files.file) {
            const file = new File(formObject.files);
            let fileObject = await file.store();
            let filepath = process.env.apiUrl + fileObject.filePartialPath;
            dataObj.user_photo = filepath;
        }

        if (!dataObj.uid || !dataObj.user_firstname || !dataObj.user_lastname)
            return this.res.send({ status: 0, message: 'Please send proper data.' });

        try {
            var uid = atob(atob(atob(atob(atob(dataObj.uid)))));
            const updatedUser = await Users.findByIdAndUpdate(uid, dataObj, { new: true });
            _this.res.send({ status: 1, message: "Admin updated successfully.", data: updatedUser });
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'updateAdmin',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async editProfile() {
        let _this = this;
        try {
            // let form = new Form(this.req);
            // let formObject = await form.parse();

            let newUser = {};
            newUser.firstname = _this.req.body.firstname;
            newUser.lastname = _this.req.body.lastname;
            newUser.mobile = _this.req.body.mobile;
            newUser.photo = _this.req.body.photo;
            // newUser.firstName = _this.req.body.firstname;
            // formObject.fields.firstName ? ((formObject.fields.firstName[0] != '' && formObject.fields.firstName != undefined)?newUser.firstName = formObject.fields.firstName[0]:delete formObject.fields.firstName) : delete formObject.fields.firstName;
            // formObject.fields.phoneNo ? ((formObject.fields.phoneNo[0] != '' && formObject.fields.phoneNo != undefined)?newUser.phoneNo = formObject.fields.phoneNo[0]:delete formObject.fields.phoneNo) : delete formObject.fields.phoneNo;
            // formObject.fields.lastName ? ((formObject.fields.lastName[0] != '' && formObject.fields.lastName != undefined)?newUser.lastName = formObject.fields.lastName[0]:delete formObject.fields.lastName) : delete formObject.fields.lastName;
            // formObject.fields.file ? ((formObject.fields.file[0] != '' && formObject.fields.file != undefined)?newUser.profileUrl = formObject.fields.file[0]:delete formObject.fields.file) : delete formObject.fields.file;
            //
            // let decoded = await Globals.decodeToken(this.req.headers.authorization);
            const admin = await Users.findOne({ role: 'admin' });
            const updatedAdmin = await Users.findByIdAndUpdate(admin._id, newUser, { new: true });
            if (_.isEmpty(updatedAdmin))
                return _this.res.send({ status: 0, message: 'Admin not updated.' })

            _this.res.send({ status: 1, message: 'Admin updated successfully', data: updatedAdmin });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'editProfile',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async changePassword() {
        let _this = this;

        try {
            ////console.log(this.req.body);
            if (!this.req.body.oldPassword || !this.req.body.newPassword)
                return _this.res.send({ status: 0, message: "Please send proper data." });
            let decoded = await Globals.decodeToken(_this.req.headers.authorization);
            let user = await new Model(Users).findOne({ _id: decoded.id, role: "admin" });
            ////console.log("user", user);
            if (_.isEmpty(user))
                return _this.res.send({ status: 0, message: 'User not found.' });

            user = user[0];

            // if(!_.isEmpty(user) && user.isDeleted)
            //     return _this.res.send({status:0, message:'User is blocked by Admin.'});
            // if(!_.isEmpty(user) && (user.isIdVerified == 'rejected' || user.isIdVerified == 'pending'))
            //     return _this.res.send({status:0, message:'User have no rights.'});

            const status = await bcrypt.compare(_this.req.body.oldPassword, user.password)
            if (!status)
                return _this.res.send({ status: 0, message: 'Please enter correct old password.' });

            let password = bcrypt.hashSync(_this.req.body.newPassword, 10)
            const updatedUser = await Users.findByIdAndUpdate(decoded.id, { password: password }, { new: true });
            if (_.isEmpty(updatedUser))
                return _this.res.send({ status: 0, message: "password not updated." });

            _this.res.send({ status: 1, message: 'Password change successfully.' });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'changePassword',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async forgotPasswordMailForAdmin() {
        let _this = this;
        if (!this.req.body.email) this.res.send({ status: 0, message: 'Please send proper data.' })

        try {
            let emailId = this.req.body.email;
            let user = await new Model(Users).findOne({ user_email: emailId });
            // //console.log("user- ", user);
            if (_.isEmpty(user))
                return _this.res.send({ status: 0, message: 'You are not authorised admin user' })
            let globalObj = new Globals();
            const token = await globalObj.generateToken(user[0]._id, 84000);
            //console.log("token ", user[0]._id)

            let updateUser = await Users.findByIdAndUpdate(user[0]._id, { user_forgotToken: token })

            ////console.log(updateUser)

            let emailObj = new Email();
            const sendingMail = await emailObj.forgotPasswordMailAdmin(emailId, token, "Reset Password Mail", 'user');
            if (!sendingMail.message) {
                return _this.res.send({ status: 0, message: 'Internal server error' });
            }

            _this.res.send({ status: 1, message: "Please check your registered mail account." });
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'forgotPasswordMailForAdmin',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }

    }

    async getUserData(){
        var _this = this;
        try{
            if(!_this.req.body.id){
                return _this.res.send({ status: 0, message: 'Please proper data' });
            }
            const serviceDataEn = await Users.findOne({_id: ObjectId(_this.req.body.id)}, {});

            return _this.res.send({ status: 1, data : serviceDataEn });

        }catch(error){
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'getUserData',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async updateUserData(){
        let _this = this;
        try {

            var objData = _this.req.body;
            if(objData.user_dob){
                objData['user_dob'] = new Date(objData.user_dob);
            }

            objData['is_profile'] = true; 

            if(objData['delete_status'] && objData["user_phone"]){
                objData["user_phone"] =  parseInt(`${objData["user_phone"]}0000`);
                objData["device_token"] =  "";
                // objData["showkt_id"] =  `delete_${objData["showkt_id"]}`;
            }else if(objData['delete_status'] && objData["user_email"]){
                objData["user_email"] =  `delete_${objData["user_email"]}`;
                objData["device_token"] =  "";
                // objData["showkt_id"] =  `delete_${objData["showkt_id"]}`;
            }
            
            console.log("objData", objData)
            const updatedAdmin = await Users.findByIdAndUpdate(objData._id, objData, { new: true });

            if(objData['delete_status']){
                await Authtokens.deleteMany({ "userId": ObjectId(objData._id) });
            }
            // console.log("updatedAdmin", updatedAdmin)
            if (_.isEmpty(updatedAdmin))
                return _this.res.send({ status: 0, message: 'User not updated.' })

            _this.res.send({ status: 1, message: 'User updated successfully' });

        } catch (error) {
            // console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'updateUserData',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async addUserData(){
        let _this = this;
        try {

            var bodyData = _this.req.body;

            var checkUser = await Users.findOne({"user_phone" : bodyData.user_phone}, {"_id":1});
            console.log("checkUser", checkUser)
            if(checkUser){
                return _this.res.send({ status: 0, message: 'User is already exists with mobile number' })
            }

            // bodyData['user_dob'] = new Date(bodyData.user_dob);

            if (bodyData.user_password) {
                bodyData['user_password'] = bcrypt.hashSync(bodyData.user_password, 10)
            }

            bodyData['is_profile'] = true;

            const newUser = await new Model(Users).store(bodyData);

            if (_.isEmpty(newUser))
                return _this.res.send({ status: 0, message: 'Error in user add.' })

            _this.res.send({ status: 1, message: 'User add successfully' });

        } catch (error) {
            // console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'addUserData',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }




    async fileUpload() {
        let _this = this;
        try {

            let form = new Form(this.req);
            let formObject = await form.parse();
            if (_.isEmpty(formObject.files))
                return _this.res.send({ status: 0, message: 'Please send file.' });
            const file = new File(formObject.files);
            let fileObject = await file.store();
            let filepath = process.env.apiUrl + fileObject.filePartialPath;
            let data = {
                filepath
            }
            _this.res.send({ status: 1, message: 'file ', data: data });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'fileUpload',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async bulkFileUpload() {
        let _this = this;
        try {

            let form = new Form(this.req);
            let formObject = await form.parse();
            ////console.log("asasas",formObject.files.gallery_image)
            //if(_.isEmpty(formObject.files.gallery_image[0]))
            //  return _this.res.send({status:0, message:'Please send file.'});

            var imgArrLength = formObject.files.gallery_image.length;
            var filearray = [];

            _.forEach(formObject.files.gallery_image, function(files, i) {
                var files = { "file": [files] }
                const file = new File(files);
                let fileObject = file.bulkStore();
                let filepath = process.env.apiUrl + fileObject.filePartialPath;
                let data = {
                    filepath
                }

                if (i == (imgArrLength - 1)) {
                    _this.res.send({ status: 1, message: 'file ', data: data });
                }
            });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'bulkFileUpload',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async removeFile() {
        let _this = this;
        try {
            const file = new File();
            let fileObject = await file.removeFile(this.req.body.file);
            _this.res.send({ status: 1, data: "File has been Deleted" });
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'removeFile',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async adminResetPassword() {
        let _this = this;

        try {
            if (!this.req.body.token || !this.req.body.confirmPassword)
                return _this.res.send({ status: 0, message: "Token does not exists" });
            let user = await new Model(Users).findOne({ forgotToken: this.req.body.token });
            //console.log("user", user[0]._id);
            if (_.isEmpty(user))
                return _this.res.send({ status: 0, message: 'Invalid token' });

            let password = bcrypt.hashSync(_this.req.body.confirmPassword, 10)
            const updatedUser = await Users.findByIdAndUpdate(user[0]._id, { password: password, forgotToken: '' }, { new: true });
            if (_.isEmpty(updatedUser))
                return _this.res.send({ status: 0, message: "password not updated." });

            _this.res.send({ status: 1, message: 'Password change successfully.' });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'adminResetPassword',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error', data: user[0]._id });
        }

    }

    async addService(){
        var _this = this;
        var ModelVar = EnServices;
        var hdiw_images = [];
        var result_images_before = [];
        var result_images_after = [];
         
        try {
             
            let form = new Form(_this.req);
            let formObject = await form.parse();
            _this.req.body = formObject.fields;
            var dataObj = {};
            //console.log('*********', _this.req.body)
            // return false
            var language = (_this.req.body.language && _this.req.body.language[0])? _this.req.body.language[0] : false;

            if(_this.req.body.title && _this.req.body.title[0].trim().length > 0){
                 dataObj['title'] =  _this.req.body.title[0].trim().toLowerCase()
            }
            if(_this.req.body.discount && _this.req.body.discount[0].trim().length > 0){
                 dataObj['discount'] =  _this.req.body.discount[0].trim();
            }
            if(_this.req.body.discount_status && _this.req.body.discount_status[0].length > 0){
                 dataObj['discount_status'] =  _this.req.body.discount_status[0];
            }
            if(_this.req.body.hdiw && _this.req.body.hdiw[0].trim().length > 0){
                 dataObj['hdiw'] =  _this.req.body.hdiw[0];
            }
            if(_this.req.body.result && _this.req.body.result[0].trim().length > 0){
                 dataObj['result'] =  _this.req.body.result[0];
            }
            if(_this.req.body.result_average_time && _this.req.body.result_average_time[0].trim().length > 0){
                 dataObj['result_average_time'] =  _this.req.body.result_average_time[0];
            }
            if(_this.req.body.service_category && _this.req.body.service_category[0].trim().length > 0){
                 dataObj['service_category'] =  _this.req.body.service_category[0];
            }
            if(_this.req.body.treatmant && _this.req.body.treatmant[0].trim().length > 0){
                 dataObj['treatmant'] =  _this.req.body.treatmant[0];
            }
            if(_this.req.body.treatment_time && _this.req.body.treatment_time[0].trim().length > 0){
                 dataObj['treatment_time'] =  _this.req.body.treatment_time[0];
            }
            if(_this.req.body.wit && _this.req.body.wit[0].trim().length > 0){
                 dataObj['wit'] =  _this.req.body.wit[0];
            }
            if(_this.req.body.price && _this.req.body.price[0].trim().length > 0){
                 dataObj['price'] = _this.req.body.price[0].trim();
            }
            if(_this.req.body.description && _this.req.body.description[0].trim().length > 0){
                 dataObj['description'] = _this.req.body.description[0].trim();
            }
            if(_this.req.body.short_description && _this.req.body.short_description[0].trim().length > 0){
                 dataObj['short_description'] = _this.req.body.short_description[0].trim();
            }
            if(_this.req.body.is_delete && _this.req.body.is_delete[0].length > 0){
                 dataObj['is_delete'] = _this.req.body.is_delete[0];
            }
            if(_this.req.body.tags && _this.req.body.tags[0].trim().length > 0){
                 dataObj['tags'] = _this.req.body.tags[0].trim();
            }

            if(_this.req.body.media_type && _this.req.body.media_type[0].length > 0){
                 dataObj['media_type'] = _this.req.body.media_type[0];
            }

            if(_this.req.body.country_price_arr && _this.req.body.country_price_arr[0].length > 0){
                dataObj['country_price_arr'] = JSON.parse(_this.req.body.country_price_arr[0]);
           }

            
            var is_add = (_this.req.body.is_add && _this.req.body.is_add[0])? true : false;
            var is_update = (_this.req.body.is_update && _this.req.body.is_update[0])? true : false;

            ////console.log("language****", language, is_add, dataObj.title)
            if(is_add && !dataObj.title){
                return _this.res.send({ status: 0, message: 'Please proper data' });
            }
            ////console.log("1111111")
            ////console.log("language****", language, ObjectId())
            if(language == 'er'){
                ModelVar = ErServices;
            }else if(language == 'de'){
                ModelVar = DeServices;
            }
            
           
            if(dataObj['media_type'] == 'Video' && formObject.files && formObject.files.envideo){
                const file = new File(formObject.files.envideo);
                console.log("file11", file)
                let fileObject = await file.store('video');
                let filepath = fileObject.filePartialPath;
                dataObj['video'] = filepath;

                // var giffObj = {
                //     input: fileObject.filePath,
                //     output: appRoot+'/public/upload/video/test.gif',
                // }

                // var gif = fs.createWriteStream(giffObj.output);

                // var options = {
                //     resize: '200:-1'
                // };

                // console.log("giffObj", giffObj)
                // try {
                //     gifify(giffObj.input, options).pipe(gif);
                //     gif.on('close', function end() {
                //         console.log('gifified ');
                //     });
                // } catch (error) {
                //     console.log("error", error)
                // }
                
            }

            if(dataObj['media_type'] == 'Video' && formObject.files && formObject.files.ervideo){
                const file = new File(formObject.files.ervideo);
                console.log("file222", file)
                let fileObject = await file.store('video');
                let filepath = fileObject.filePartialPath;
                dataObj['video'] = filepath;
            }

            if (formObject.files && formObject.files.file) {
                const file = new File(formObject.files);
                let fileObject = await file.store('service_image');
                let filepath = fileObject.filePartialPath;
                dataObj.photo = filepath;
            }

            if (formObject.files && formObject.files.file) {
                const file = new File(formObject.files);
                let fileObject = await file.store('service_image');
                let filepath = fileObject.filePartialPath;
                dataObj.photo = filepath;
            }

            if (formObject.files && formObject.files.hdiw_images) {
                var hdiw_images_arr = await this.multiImageUpload(formObject.files.hdiw_images); 
                ////console.log("hdiw_images_arr", hdiw_images_arr)               
                hdiw_images = hdiw_images_arr;
            }

            if (formObject.files && formObject.files.result_images_before) {
                var result_images_before_arr = await this.multiImageUpload(formObject.files.result_images_before);
                ////console.log("result_images_before_arr", result_images_before_arr)
                result_images_before = result_images_before_arr;
            }

            if (formObject.files && formObject.files.result_images_after) {
                var result_images_after_arr = await this.multiImageUpload(formObject.files.result_images_after);
                ////console.log("result_images_after_arr", result_images_after_arr)
                result_images_after = result_images_after_arr
            }

            if(is_update){

                
                if(_this.req.body.hdiw_images_arr && _this.req.body.hdiw_images_arr.length > 0){
                    
                    var hdiw_images =  hdiw_images.concat(JSON.parse(_this.req.body.hdiw_images_arr[0]));
                    ////console.log("_this.req.body.hdiw_images_arr", hdiw_images)
                }

                if(_this.req.body.result_images_before_arr && _this.req.body.result_images_before_arr.length > 0){
                    var result_images_before = result_images_before.concat(JSON.parse(_this.req.body.result_images_before_arr[0]));
                }
                if(_this.req.body.result_images_after_arr && _this.req.body.result_images_after_arr.length > 0){
                    var result_images_after = result_images_after.concat(JSON.parse(_this.req.body.result_images_after_arr[0]));
                }

                dataObj['hdiw_images'] = hdiw_images;
                dataObj['result_images_before'] = result_images_before;
                dataObj['result_images_after'] = result_images_after;

                ////console.log("dataObj", dataObj)
                //return false;
                var sid = (_this.req.body.sid && _this.req.body.sid[0])? ObjectId(_this.req.body.sid[0]) : false;
                //console.log("sid", sid, dataObj)

                var srId = await ModelVar.findOne({_id : ObjectId(sid)},{"_id":1});
                //console.log("srId", srId)
                //dataObj['updatedAt'] = Date.now();
                if(srId){
                    const updatedService = await ModelVar.findByIdAndUpdate(ObjectId(sid), dataObj, { new: true });
                    if (_.isEmpty(updatedService))
                        return _this.res.send({ status: 0, message: 'Error in service update' });
                    _this.res.send({ status: 1, message: 'Service updated successfully' });
                }else{
                    dataObj['_id'] =  ObjectId(sid);
                    var EnServicesData = new ModelVar(dataObj);
                    EnServicesData.save(function(err, serdata) {
                        ////console.log(err, data)
                        if (err) {
                            _this.res.send({ status: 0, message: 'Error in service update' });
                        } else {
                            if(language == 'er'){
                                _this.sendNotificationToUser(serdata);
                            }                
                           _this.res.send({ status: 1, message: 'Service updated successfully', data:serdata._id  });
                        }
                    });
                }
                
            }else if(is_add){                
                if(language == 'en'){
                    dataObj['_id'] = ObjectId();
                }else{
                    dataObj['_id'] = _this.req.body.id[0];
                }
                dataObj['hdiw_images'] = hdiw_images;
                dataObj['result_images_before'] = result_images_before;
                dataObj['result_images_after'] = result_images_after;
                ////console.log("dataObj['_id']",language, '-----', dataObj['_id'])
                var EnServicesData = new ModelVar(dataObj);
                EnServicesData.save(function(err, serdata) {
                    ////console.log(err, data)
                    if (err) {
                        _this.res.send({ status: 0, message: 'Error in service add' });
                    } else { 
                        if(language == 'er'){
                            _this.sendNotificationToUser(serdata);
                        }               
                       _this.res.send({ status: 1, message: 'Service added successfully', data:serdata._id });
                    }
                });
                // const newService = await EnServices.save(dataObj);
                // //const newService = await new Model(ModelVar).store(dataObj);
                // if (_.isEmpty(newService))
                //     return _this.res.send({ status: 0, message: 'Error in service add' });
                // _this.res.send({ status: 1, message: 'Service added successfully' });
            }

        } catch (error) {
            //console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'addService',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async sendNotificationToUser(serdata){
        var filter ={};
        var _this = this
        try{

            filter = { "user_role" : "user", delete_status: false};

            const userListCount = await Users.find(filter, {"_id":1}).countDocuments();;

           _this.userPaginate(userListCount, 0, 1, 20, serdata, function(){

           })

        }catch(error){
            //console.log("error", error)
        }
    }

    async userPaginate(userListCount, length, page, pagesize, serdata, cb){
        var _this = this;
        try{
            ////console.log(userListCount, length, page, pagesize)
            if(length <= userListCount){
                var filter = { "user_role" : "user", delete_status: false};

                let skip = (page - 1) * (pagesize);
                let sort = { "createdAt": -1 };

                var userList = await Users.find(filter, {"device_token":1, "user_email":1, "os_type":1, "localization":1, "user_fullname":1}).sort(sort).skip(skip).limit(pagesize);
                length = page*pagesize;

                ////console.log("length", length);

                this.saveNotification(userList, serdata, function(notRes){
                    ////console.log("res", notRes)

                    page++
                    _this.userPaginate(userListCount, length, page, pagesize, serdata, cb)
                });
                
            }else{
                cb(true)
            }
            ////console.log("userList", userListCount)
        }catch(error){
            //console.log("error", error)
        }
    }

    async saveNotification(userdata, serdata, cb) {
        var _this = this;
        try {
            
            if(userdata.length > 0){
                //////console.log('data', data)
                var i = userdata[0];
                    var body_msg = (i.localization == 'en')? langEn.noti_new_service_text : langEr.noti_new_service_text;
                    var title = (i.localization == 'en')? langEn.noti_new_service_title : langEr.noti_new_service_title;

                    var notofyData = {                
                        body_msg: body_msg,
                        title : title,
                        notify_type : 'new_service_arrived',
                        user_id : i._id,
                        target_screen: "service_detail_screen",
                        read_status: 'unread',
                        service_id : serdata._id,
                        service_title : serdata.title,
                        deletestatus : false,
                        token : i.device_token,
                        os_type : i.os_type    
                    };

                    var notiData  = await Notifications.create(notofyData);
                    // //console.log("notiData", notiData)
                    notofyData['noti_id'] = notiData._id;

                    // //console.log("notofyData", i._id)
                    if(i.device_token){
                        var sss = await NotificationObj.send(notofyData, 'new_service_arrive')
                        userdata.splice(0,1)
                        this.saveNotification(userdata, serdata, cb)
                    }else{
                         userdata.splice(0,1)
                        this.saveNotification(userdata, serdata, cb)
                    }
                   
            }else{
                cb(true)
            }             
        } catch (error) {
            //console.log('error', error)
            userdata.splice(0,1)
            this.saveNotification(userdata, serdata, cb)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'Transaction Route Api',
                finction_name : 'saveNotification',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
        }

    }

    async multiImageUpload(hdiw_images){
        try{
            return new Promise(async(resolve, reject) => {
                var hdiw_images_array = [];
                ////console.log("hdiw_images***********", hdiw_images)
                for (let i = 0; i < hdiw_images.length; i++) {
                    const file = new File([hdiw_images[i]]);
                    ////console.log("file****", file)
                    let fileObject = await file.store('service_image');
                    let filepath = fileObject.filePartialPath;
                    hdiw_images_array.push(filepath);
                    if(i === (hdiw_images.length - 1)){
                        return resolve(hdiw_images_array);
                    }
                }
            });
        }catch(error){
            //console.log("error",error)
        }
    }

    async getServiceList() {
        let _this = this;
        let filter = '';
        var ModelVar = "";
        if (!this.req.body.page || !_this.req.body.pagesize || !_this.req.body.localization) {
            return this.res.send({ status: 0, message: 'Please send proper data.' });
        }

        try {

            ////console.log("language****", this.req.body.localization)
            if(this.req.body.localization == 'er'){
                ModelVar = ErServices;
            }else if(this.req.body.localization == 'de'){
                ModelVar = DeServices;
            }

            // if(_this.req.body.is_from && _this.req.body.is_from === 'search'){
            //     filter = {
            //         "$and": [
            //             {
            //                 $or: [
            //                     {"title": { $regex: _this.req.body.search_text, $options: 'i' }},
            //                     //{"service_category": { $regex: _this.req.body.search_text, $options: 'i' }},
            //                 ]
            //             },
            //             //{ delete_status: false }
            //         ]
            //     }   
            // }

            filter = { status: true, is_delete: false,  };
            let skip = (_this.req.body.page - 1) * (_this.req.body.pagesize);
            let sort = { sequence: 1 };
            if (_this.req.body.sort) {
                sort = _this.req.body.sort;
            }

            if(_this.req.body.is_from && _this.req.body.is_from === 'search'){
                filter['$or'] = [
                        {"title": { $regex: _this.req.body.search_text, $options: 'i' }},
                    ]
                
            }


            //console.log("filter1",filter)
            const serviceListing = await (new User(ModelVar)).getServiceList(skip, _this.req.body.pagesize, sort, filter);
            const total = await (new User(ModelVar)).serviceListCount(sort, filter);
            ////console.log("total", total)
            _this.res.send({
                status: 1,
                message: 'Service list',
                data: serviceListing,
                page: _this.req.body.page,
                perPage: _this.req.body.pagesize,
                localization : this.req.body.localization,
                total: (total && total.length > 0)? total[0].totalCount : 0
            });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'User Route Api',
                finction_name : 'getServiceList',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async addClinicService(){
        var _this = this;
        try{

            var dataObj = {
                "server_id" : ObjectId(_this.req.body.server_id),
                "clinic_id" : ObjectId(_this.req.body.clinic_id)
            }
            const newService = await new Model(ServiceClinics).store(dataObj);

            return this.res.send({ status: 1, data: newService });
        }catch(error){
            //console.log("error", error)
            return this.res.send({ status: 0, message: 'server error' });
        }
    }

    async getClinicList() {
        let _this = this;
        let filter = '';

        if (!this.req.body.page || !_this.req.body.pagesize) {
            return this.res.send({ status: 0, message: 'Please send proper data.' });
        }

        try {

            filter = { status: true, is_delete: false, server_id : ObjectId(_this.req.body.sid) };
            let skip = (_this.req.body.page - 1) * (_this.req.body.pagesize);
            let sort = { createdAt: 1 };
            if (_this.req.body.sort) {
                sort = _this.req.body.sort;
            }

            ////console.log("filter1", skip, _this.req.body.pagesize, sort, filter)
            const serviceListing = await (new User(ServiceClinics)).getClinicList(skip, _this.req.body.pagesize, sort, filter);
            const total = await (new User(ServiceClinics)).clinicListCount(sort, filter);
            //console.log("total", total)
            _this.res.send({
                status: 1,
                message: 'Service list',
                data: serviceListing,
                page: _this.req.body.page,
                perPage: _this.req.body.pagesize,
                total: (total && total.length > 0)? total[0].totalCount : 0
            });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'User Route Api',
                finction_name : 'getServiceList',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async getSeviceDetail(){
        var _this = this;
        var ModelVar = EnServices;
        try{

            if(!_this.req.body.sid || !_this.req.body.localization){
                return _this.res.send({ status: 0, message: 'Please proper data' });
            }

            //console.log("language****", this.req.body.localization)
            if(this.req.body.localization == 'er'){
                ModelVar = ErServices;
            }else if(this.req.body.localization == 'de'){
                ModelVar = DeServices;
            }

            var filter = {
                $and: [
                        { "_id": ObjectId(_this.req.body.sid) },
                        { "status": true },
                        { "is_delete": false }
                    ]
            }
            const serviceDataEn = await EnServices.findOne({_id: ObjectId(_this.req.body.sid)}, {});
            const serviceDataEr = await ErServices.findOne({_id: ObjectId(_this.req.body.sid)}, {});
            const serviceDataDe = await DeServices.findOne({_id: ObjectId(_this.req.body.sid)}, {});
            return _this.res.send({ status: 1, data : {en : serviceDataEn, er : serviceDataEr, de:serviceDataDe}  });
        }catch(error){
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'getSeviceDetail',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    
    
    async getServiceListTitles(){
        var _this = this;
        var ModelVar = EnServices;
        try{
            if(!_this.req.body.localization){
                return _this.res.send({ status: 0, message: 'Please proper data' });
            }

            //console.log("language****", this.req.body.localization)
            if(this.req.body.localization == 'er'){
                ModelVar = ErServices;
            }else if(this.req.body.localization == 'de'){
                ModelVar = DeServices;
            }

            var filter = {
                $and: [
                        
                        { "status": true },
                        { "is_delete": false }
                    ]
            }

            const serviceDataEn = await ModelVar.find(filter, {title:1}).sort({"createdAt":-1});
            return _this.res.send({ status: 1, data : serviceDataEn  });
        }catch(error){
            //console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'getServiceListTitles',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }

    }

    async getClinicTimeSlot(){
        try{

        }catch(error){

        }
    }

    getHash(nonce, timestamp, key, base_string){
        try{
            return new Promise((resolve, reject) => {
                var hmac = crypto.createHmac('sha1', key);
                hmac.update(base_string); 
                var signature = hmac.digest('base64');
                var newArray = {
                    signature : signature,
                    nonce : nonce,
                    timestamp : timestamp
                }
                return resolve(newArray);
            });
        }catch(error){

        }
    };

    async fetchNetsuiteEvents(){
        var _this = this;
        try{

            var NETSUITE_SCRIPT_ID = '1418';
            if(_this.req.body.type == 'emp'){
                NETSUITE_SCRIPT_ID = '1412';
            }else if(_this.req.body.type == 'cus'){
                NETSUITE_SCRIPT_ID = '1410';
            }else if(_this.req.body.type == 'clinic'){
                NETSUITE_SCRIPT_ID = '1414';
            }

            // crypto.randomBytes(16).toString('base64');
            var NETSUITE_URL = 'https://3559763.restlets.api.netsuite.com/app/site/hosting/restlet.nl';// 'https://3559763.restlets.api.netsuite.com/app/site/hosting/restlet.nl';
            var NETSUITE_CONSUMER_KEY = "b873d44cd8414ac6a74d9957a79eda43426c71904d9528a3f15cfdc614450f4c";
            var NETSUITE_TOKEN_ID = "f1b2b6a899641f7f20d2ebfa7a68158e170e68ae340f567f9d58003df39a2fdc";
            var NETSUITE_TOKEN_SECRET = "3cb19e46d1331042103847d9305605f32dd294830b4374b79e9aa831c25f2151";
            var NETSUITE_CONSUMER_SECRET = "529a0628e3db12042a2ff4bb841e1a254ed5b137ae34df44d1793490c36f7aca";
            //var timestamp =  Math.floor(new Date().getTime() / 1000); //Date.now();// new Date().getTime();
            var NETSUITE_DEPLOY_ID = '1';
            var oauth_version = "1.0";
            var oauth_signature_method = 'HMAC-SHA1';
            var NETSUITE_ACCOUNT = '3559763';
            

            var nonce = md5(Math.random());
            var timestamp =  Math.floor(new Date().getTime() / 1000);

            var key = encodeURIComponent(NETSUITE_CONSUMER_SECRET)+'&'+encodeURIComponent(NETSUITE_TOKEN_SECRET);

            var base_string =
            "POST&"+encodeURIComponent(NETSUITE_URL) + "&" +
            encodeURIComponent(
                "deploy=" + NETSUITE_DEPLOY_ID
              + "&oauth_consumer_key=" + NETSUITE_CONSUMER_KEY
              + "&oauth_nonce=" + nonce
              + "&oauth_signature_method=" + oauth_signature_method
              + "&oauth_timestamp=" + timestamp
              + "&oauth_token=" + NETSUITE_TOKEN_ID
              + "&oauth_version=" + oauth_version
              + "&realm=" + NETSUITE_ACCOUNT
              + "&script=" + NETSUITE_SCRIPT_ID
            );

            var hmac = crypto.createHmac("sha1", key).update(base_string).digest('hex');
            //var signature =  base64encode(hmac);

            var res = await _this.getHash(nonce, timestamp, key, base_string);

            var auth_header = "OAuth "
            + 'oauth_signature="'+encodeURIComponent(res.signature)+'", '
            + 'oauth_version="'+encodeURIComponent(oauth_version)+'", '
            + 'oauth_nonce="'+encodeURIComponent(res.nonce)+'", '
            + 'oauth_signature_method="' + encodeURIComponent(oauth_signature_method) + '", '
            + 'oauth_consumer_key="' + encodeURIComponent(NETSUITE_CONSUMER_KEY) + '", '
            + 'oauth_token="' + encodeURIComponent(NETSUITE_TOKEN_ID) + '", '  
            + 'oauth_timestamp="'+encodeURIComponent(res.timestamp)+'", '
            + 'realm="' + encodeURIComponent(NETSUITE_ACCOUNT) +'"';
            
            var post_data = JSON.stringify({"clinicName": _this.req.body.clinic,"startdate": _this.req.body.date});

            // var ddd =  {
            //     "serviceOffered" : "coolsculpting",
            //     "rangeEndDate": "9/6/2020",
            //     "rangeStartTime": "10:30 AM",
            //     "rangeEndTime": "1:30 PM",
            //     "city": "Ciudad de México"
            // }
            // var post_data = JSON.stringify(ddd);

              // An object of options to indicate where to post to
            var post_options = {
                  host: '3559763.restlets.api.netsuite.com',
                  port: 443,
                  path: '/app/site/hosting/restlet.nl?&script='+NETSUITE_SCRIPT_ID+'&deploy='+NETSUITE_DEPLOY_ID+'&realm='+NETSUITE_ACCOUNT,
                  method: 'POST',
                  headers: {
                      'Authorization': auth_header,
                      'Content-Type': 'application/json',
                      'Content-Length': Buffer.byteLength(post_data, 'utf8')
                  }
            };
           //console.log("post_options", post_options);
            var post_req = https.request(post_options, function(res) {
                    var body = '';
                    res.on('data', function(d) {
                        body = body + d;
                        //
                    });
                    res.on('end',function(){
                      ////console.log("Body :" + body);
                      return _this.res.send({ status: 1, data: JSON.parse(body) });
                      
                    });

            });

            post_req.write(post_data);
            post_req.end();
            post_req.on('error', function(e) {
                //console.error('error',e);
            });

        }catch(error){
            //console.log("error", error)
        }
    }

    async getUserLocationInfo(){
        var _this = this;
        var filter = {};
        try {

            if (!this.req.body.user_id) {
                return this.res.send({ status: 0, message: 'Please send proper data.' });
            }

            
            filter = {"user_id": ObjectId(this.req.body.user_id)}
            var pagesize = this.req.body.pagesize;


             let skip = (this.req.body.page - 1) * (pagesize);
            let sort = this.req.body.sort;

            var userList = await Location.find(filter, {}).sort(sort).skip(skip).limit(pagesize);
            var LocationCount = await Location.find(filter, {"_id":1}).countDocuments();;
            
            
            const locData = await new Model(Location).find(filter,{},{}, this.req.body.sort);

            ////console.log(userListing);
            _this.res.send({
                status: 1,
                message: 'Location data',
                data: locData,
                total : LocationCount
            })

        } catch (error) {
            //console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'getUserLocationInfo',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async getAllDashboardData(){
        var _this = this;
        var filter = {};
        try{

        } catch (error) {
            //console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from : 'API Error',
                api_name : 'admin Route Api',
                finction_name : 'getUserLocationInfo',
                error_title : error.name,
                description : error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

}

module.exports = AdminController
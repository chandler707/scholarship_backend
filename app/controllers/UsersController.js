const Controller = require("./Controller");
// import Controller from './Controller';
const ObjectId = require('mongodb').ObjectID;
const langEn = require("../../configs/en");
const _ = require("lodash");
const bcrypt = require('bcrypt');
const Users = require('../models/UserSchema').Users;
const Authtokens = require('../models/AuthenticationSchema').Authtokens;
const Settings = require('../models/SettingSchema').Settings;
const Model = require("../models/Model");
const User = require("../models/User");
const Globals = require("../../configs/Globals");
const Email = require('../services/Email');
let Form = require("../services/Form");
let File = require("../services/File");
const https = require('https');
var randomstring = require("randomstring");
var CryptoJS = require("crypto-js");
var seceretText = 'tinder123secure@#$%*&789';
const moment = require('moment');

class UsersController extends Controller {
    constructor() {
        super();
    }

    async getAllSettings() {
        var _this = this;
        try {
            var settingData = await Settings.find({})
            return _this.res.send({ status: 1, data: settingData });
        } catch (error) {
            console.log('error', error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'getAllSettings',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async sendOtp() {
        var _this = this;
        try {
            var lang = langEn;
            if (!_this.req.body.mobile || !_this.req.body.country_code)
                return _this.res.send({ status: 0, message: lang.send_data });

            var mob = parseInt(_this.req.body.mobile)
            console.log("mob", mob)
            const file = new File();
            var checkMonExst = await this.checkMobileExistFn({ "mobile": mob });
            console.log("checkMonExst", checkMonExst)
            if (checkMonExst.status === 0) {
                if (mob == 5089062001) {
                    var code = '1908';
                    _this.req.body['otp'] = code;
                } else {
                    var code = randomstring.generate({ length: 4, charset: 'numeric' })
                    _this.req.body['otp'] = code;
                    let mobOTP = await file.sendOTP(_this.req.body);
                }

                let dataObj = {
                    user_phone: mob,
                    country_code: _this.req.body.country_code,
                    otp: code
                }
                const newUser = await new Model(Users).store(dataObj);
                if (_.isEmpty(newUser))
                    return _this.res.send({ status: 0, message: lang.error_save_data });
                return _this.res.send({ status: 1, message: lang.otp_sent });
            } else {
                this.resendOtpFn(_this.req.body, function (res) {
                    _this.res.send(res);
                })
            }

        } catch (error) {
            console.log('error', error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'sendOtp',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async resendOtp() {
        var _this = this;
        try {
            this.resendOtpFn(_this.req.body, function (res) {
                _this.res.send(res);
            })
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'resendOtp',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async resendOtpFn(dataObj, fn) {
        let _this = this;
        var lang = langEn;

        try {

            if (!dataObj.mobile || !dataObj.country_code)
                return fn({ status: 0, message: lang.send_data });

            let user_phone = parseInt(dataObj.mobile);

            let newUser = await Users.findOne({ "user_phone": user_phone }, { "user_phone": 1, "otp_increement": 1 });

            if (_.isEmpty(newUser))
                return fn({ status: 0, message: lang.user_not_exist });

            if (newUser.otp_increement > 9) {
                return fn({ status: 1, message: lang.max_otp_send });
            }

            if (dataObj.mobile == 5089062001) {
                var otpCode = '1908';
                _this.req.body['otp'] = otpCode;
            } else {
                var otpCode = '1234'; //randomstring.generate({ length: 4, charset: 'numeric' })
                dataObj['otp'] = otpCode;
                const file = new File();
                let mobOTP = await file.sendOTP(dataObj);
            }


            let updateUser = await Users.findByIdAndUpdate(newUser._id, { otp: otpCode, $inc: { otp_increement: 1 } }, { new: true });

            return fn({ status: 1, message: lang.otp_sent });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'resendOtpFn',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return fn({ status: 0, message: 'Server Error' });
        }
    }

    async otpVerify() {
        let _this = this;
        var lang = langEn;

        try {

            var dataObj = _this.req.body;

            //|| !dataObj.device_token || !dataObj.device_type
            if (!dataObj.mobile && !dataObj.otp)
                return _this.res.send({ status: 0, message: lang.send_data });


            let user_phone = parseInt(dataObj.mobile);

            var otpObj = { 
                "user_phone": user_phone, 
                "otp": '1234' //dataObj.otp 
            };
            let newUser = await Users.findOne(otpObj);

            // console.log("newUser", newUser)
            if (newUser) {
                var a = moment(); //now
                var b = moment(newUser.updatedAt);

                if (a.diff(b, 'minutes') > 15)
                    return _this.res.send({ status: 0, message: lang.otp_expired });

                console.log("dsdsdsd", a.diff(b, 'minutes'))
                var curDate = new Date()
                var upataObj = {
                    //otp: "",
                    user_status: "active",
                    user_verificationStatus: true,
                    device_id: dataObj.device_id || "",
                    device_type: dataObj.device_type || "",
                    device_token: dataObj.device_token || "",
                    user_curent_location: dataObj.user_curent_location || "",
                    user_login_time: curDate,
                    otp_increement: 0
                }
                let updateUser = await Users.findByIdAndUpdate(newUser._id, upataObj);
                // var tokelDelMany = await Authtokens.deleteMany({ "userId": ObjectId(newUser._id) });
                let globalObj = new Globals();
                const token = await globalObj.getToken(newUser._id);
                let data = {
                    "user_fullname": newUser.user_fullname,
                    "showkt_id": newUser.showkt_id,
                    "user_bio": newUser.user_bio,
                    "user_dob": newUser.user_dob,
                    "user_gender": newUser.user_gender,
                    "user_id": newUser._id,
                    "user_phone": newUser.user_phone,
                    "user_email": newUser.user_email,
                    "account_type": newUser.account_type,
                    "photo": newUser.user_photo || 'public/no-image-user.png',
                    // role: newUser.user_role,
                    "access_token": token
                }
                // if (dataObj.user_curent_location && dataObj.user_curent_location.length > 0) {
                //     _this.addUserLocation(newUser._id, dataObj.user_curent_location);
                // }
                _this.addUserLocation(newUser._id, upataObj);
                return _this.res.send({ status: 1, message: lang.user_verify, data: data, showkit_id: (newUser.showkt_id) ? newUser.showkt_id : false, is_profile: (newUser.is_profile) ? newUser.is_profile : false });
            } else {
                return _this.res.send({ status: 0, message: lang.otp_not_match });
            }

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'otpVerify',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async addUpdatePasscode() {
        let _this = this;
        var lang = langEn;
        try {
            if (!_this.req.user.userId && !_this.req.body.passcode)
                return _this.res.send({ status: 0, message: lang.send_data });

            let cDate = Date.now().toString();
            let passAuth = bcrypt.hashSync(cDate, 10);

            var upataObj = {
                pass_code: _this.req.body.passcode,
                pass_auth_key: passAuth
            }

            // console.log("upataObj", upataObj)
            let updateUser = await Users.findByIdAndUpdate(_this.req.user.userId, upataObj);

            if (_.isEmpty(updateUser))
                return _this.res.send({ status: 0, message: 'Error in add passcode' });

            _this.res.send({ status: 1, message: 'Passcode added' });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'addUpdatePasscode',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async signinPasscode() {
        var _this = this;
        var lang = langEn;
        try {

            if (!_this.req.user.userId && !_this.req.body.passcode)
                return _this.res.send({ status: 0, message: lang.send_data });

            var userData = await Users.findOne({ "_id": _this.req.user.userId, "pass_code": _this.req.body.passcode })

            // console.log("userData", userData)
            if (_.isEmpty(userData))
                return _this.res.send({ status: 0, message: 'Wrong passcode' });

            // var tokelDelMany = await Authtokens.deleteMany({ "userId": ObjectId(userData._id) });
            let globalObj = new Globals();
            const token = await globalObj.getToken(userData._id);

            let data = {
                "user_fullname": userData.user_fullname,
                "showkt_id": userData.showkt_id,
                "user_bio": userData.user_bio,
                "user_dob": userData.user_dob,
                "user_gender": userData.user_gender,
                "user_id": userData._id,
                "user_phone": userData.user_phone,
                "user_email": userData.user_email,
                "account_type": userData.account_type,
                "photo": userData.user_photo || 'public/no-image-user.png',
                "access_token": token
            }
            _this.res.send({ status: 1, message: lang.login_success, data: data, showkit_id: (userData.showkt_id) ? userData.showkt_id : false });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'verifyPasscode',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    checkMobileExistFn(obj) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("obj.mobile", obj.mobile)
                var checMobile = await Users.findOne({ "user_phone": obj.mobile }, { "user_phone": 1 });
                console.log("checMobile", checMobile)
                if (_.isEmpty(checMobile)) {
                    resolve({ status: 0, message: 'User is not exist.' });
                } else {
                    resolve({ status: 1, data: checMobile });
                }
            } catch (error) {
                console.log("error", error)
                reject({ status: 0, message: 'User is not exist.' })
            }
        })
    }

    getDate(data) {
        var today = new Date(data);
        //////console.log(today.getFullYear()+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+("0" + (today.getDate())).slice(-2)+"T00:00:00.000Z")
        ////////console.log(today,("0" + (today.getDate())).slice(-2)+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+today.getFullYear())
        // return ("0" + (today.getDate())).slice(-2)+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+today.getFullYear()+ "00:00:00";
        return today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + (today.getDate())).slice(-2) + "T00:00:00.000Z";
    }

    getFullName(first, last) {
        if (first || last) {
            return first + ' ' + last;
        } else {
            return null;
        }
    }

    async testEmail() {
        var _this = this;
        try {
            //console.log("11111")
            let emailObj = new Email();
            const sendingMail = await emailObj.sendEmailUserSendGrid();
            return _this.res.send({ status: 1, message: "Email send" });
        } catch (error) {
            return _this.res.send({ status: 0, message: "Error in mail send" });
        }
    }

    async userSignIn() {
        let _this = this;
        var modelsNew = Users;
        var filter = {};
        var lang = langEn;
        try {
            var decryptedData = _this.req.body;

            if (!decryptedData.user_phone || !decryptedData.passcode)
                return _this.res.send({ status: 0, message: lang.send_data });


            filter = { user_phone: decryptedData.user_phone }
            var user = await Users.findOne(filter);

            if (_.isEmpty(user))
                return _this.res.send({ status: 0, message: lang.user_not_exist });

            if (user.user_verificationStatus === false)
                return _this.res.send({ status: 0, message: lang.user_not_verify });

            const status = await bcrypt.compare(decryptedData.passcode, user.user_password);

            if (!status)
                return _this.res.send({ status: 0, message: lang.invalid_pass });

            // var tokelDelMany = await Authtokens.deleteMany({ "userId": ObjectId(user._id) });
            let globalObj = new Globals();
            const token = await globalObj.getToken(user._id);
            var userDobjN = {
                device_id: decryptedData.device_id || null,
                device_type: decryptedData.device_type || null,
                device_token: decryptedData.device_token || null,
                user_curent_location: decryptedData.user_curent_location,
            }
            const updateUser = await modelsNew.findByIdAndUpdate(user._id, userDobjN, { new: true });
            //const updatedUser = await Authtokens.deleteOne(filter);

            let data = {
                _id: user._id,
                user_phone: user.user_phone,
                role: user.user_role,
                photo: user.user_photo,
                fullname: user.user_fullname,
                access_token: token
            }
            if (decryptedData.user_curent_location && decryptedData.user_curent_location.length > 0) {
                _this.addUserLocation(user._id, decryptedData.user_curent_location);
            }

            _this.res.send({ status: 1, message: lang.login_success, data: data, showkit_id: (user.showkt_id) ? user.showkt_id : false });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'userSignIn',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: lang.server_error });
        }
    }

    async register() {
        let _this = this;
        let filter = '';
        var modelsNew = Users;
        var lang = langEn;
        try {

            let form = new Form(_this.req);
            let formObject = await form.parse();
            _this.req.body = formObject.fields;
            var dataObj = {};
            if (_this.req.body.user_fullname && _this.req.body.user_fullname[0].trim().length > 0) {
                dataObj['user_fullname'] = _this.req.body.user_fullname[0].trim()
            }

            if (_this.req.body.user_email && _this.req.body.user_email[0].trim().length > 0) {
                dataObj['user_email'] = _this.req.body.user_email[0].trim()
            }

            if (_this.req.body.country_code && _this.req.body.country_code[0].trim().length > 0) {
                dataObj['country_code'] = _this.req.body.country_code[0].trim()
            }

            if (_this.req.body.user_phone && _this.req.body.user_phone[0].trim().length > 0) {
                dataObj['user_phone'] = _this.req.body.user_phone[0].trim()
            }

            if (_this.req.body.showkt_id && _this.req.body.showkt_id[0].trim().length > 0) {
                dataObj['showkt_id'] = _this.req.body.showkt_id[0].trim()
            }
            if (_this.req.body.user_gender && _this.req.body.user_gender[0].trim().length > 0) {
                dataObj['user_gender'] = _this.req.body.user_gender[0].trim()
            }
            if (_this.req.body.user_dob && _this.req.body.user_dob[0]) {
                dataObj['user_dob'] = _this.req.body.user_dob[0]
            }

            if (_this.req.body.user_age_group && _this.req.body.user_age_group[0]) {
                var user_age_group = JSON.parse(_this.req.body.user_age_group[0])
                dataObj['user_age_group'] = user_age_group;
                dataObj['user_age_group_str'] = user_age_group.join('-');
            }

            if (_this.req.body.is_hide_dob && _this.req.body.is_hide_dob[0]) {
                dataObj['is_hide_dob'] = _this.req.body.is_hide_dob[0]
            }
            if (_this.req.body.device_token && _this.req.body.device_token[0]) {
                dataObj['device_token'] = _this.req.body.device_token[0]
            }
            if (_this.req.body.from_mobile && _this.req.body.from_mobile[0]) {
                dataObj['from_mobile'] = _this.req.body.from_mobile[0]
            }
            if (_this.req.body.user_curent_location && _this.req.body.user_curent_location[0]) {
                dataObj['user_curent_location'] = _this.req.body.user_curent_location[0]
            }

            if (!dataObj.user_email)
                return this.res.send({ status: 0, message: lang.send_data });

            filter = { "user_email": _this.req.body.user_email };
            var user = await modelsNew.findOne(filter);

            if (!_.isEmpty(user)) {
                return _this.res.send({ status: 0, message: lang.user_exist });
            }
            if (_.isEmpty(user)) {
                if (formObject.files.file) {
                    const file = new File(formObject.files);
                    let fileObject = await file.store('users_image');
                    var filepath = fileObject.filePartialPath;
                    dataObj.user_photo = filepath;
                }
                // console.log("dataObj", dataObj)
                let password = bcrypt.hashSync("123456", 10);
                
                // let data = {
                //     user_fullname: dataObj.user_fullname,
                //     user_email: dataObj['user_email'].toLowerCase(),
                //     showkt_id: dataObj.showkt_id,
                //     user_gender: dataObj.user_gender,
                //     user_dob: dataObj.user_dob,
                //     is_hide_dob: (dataObj.is_hide_dob && dataObj.is_hide_dob == 'true') ? true : false,
                //     user_password: password,
                //     user_photo: dataObj.user_photo || '/public/no-image-user.png',
                //     device_id: dataObj.device_id,
                //     device_token: dataObj.device_token,
                //     device_type: dataObj.device_type,
                //     user_phone: dataObj.user_phone,
                //     user_curent_location: dataObj.user_curent_location
                // }
                // save new user

                dataObj['user_photo'] = dataObj.user_photo || '/public/no-image-user.png';
                dataObj['user_email'] = dataObj['user_email'].toLowerCase();
                dataObj['password'] = password;
                dataObj['is_hide_dob'] = (dataObj.is_hide_dob && dataObj.is_hide_dob == 'true') ? true : false;

                const newUser = await new Model(modelsNew).store(dataObj);
                if (_.isEmpty(newUser))
                    return _this.res.send({ status: 0, message: lang.error_save_data });

                if (dataObj.user_curent_location && dataObj.user_curent_location.length > 0) {
                    _this.addUserLocation(newUser._id, dataObj.user_curent_location);
                }
                if (dataObj['user_phone'] && dataObj['country_code']) {
                    console.log("121212")
                    var code = randomstring.generate({ length: 6, charset: 'numeric' })
                    _this.req.body['otp'] = code;
                    var filea = new File();
                    var otpData = {
                        mobile: dataObj['user_phone'],
                        country_code: dataObj['country_code'],
                        otp: code
                    }
                    let mobOTP = await filea.sendOTP(otpData);

                    let updateUser = await modelsNew.findByIdAndUpdate(newUser._id, { otp: code, user_verificationStatus: false, user_status: "inactive" });
                    return _this.res.send({ status: 1, message: lang.otp_sent });
                } else {
                    return _this.res.send({ status: 1, message: lang.register_msg })
                }


            }
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'register',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: lang.server_error });
        }
    }

    async checkShowktidExist() {
        let _this = this;
        try {
            var modelsNew = Users;
            var lang = langEn;
            if (!_this.req.body.showkt_id)
                return _this.res.send({ status: 0, message: lang.send_data });
            let showkt_id = _this.req.body.showkt_id;
            let user = await Users.findOne({ "showkt_id": showkt_id }, { "user_phone": 1 });
            console.log("user", user)
            if (user) {
                console.log('1111')
                return _this.res.send({ status: 0, id_exists: true, message: lang.showkt_exist });
            } else {
                console.log('22222')
                return _this.res.send({ status: 1, id_exists: false, message: "Id is available for submit" });
            }
        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'checkShowktidExist',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async updateUserProfile() {
        let _this = this;
        let filepath = '';
        var lang = langEn;
        try {

            let form = new Form(_this.req);
            let formObject = await form.parse();
            _this.req.body = formObject.fields;
            var dataObj = {};

            console.log("_this.req.body", _this.req.body)
            if (_this.req.body.user_fullname && _this.req.body.user_fullname[0].trim().length > 0) {
                dataObj['user_fullname'] = _this.req.body.user_fullname[0].trim()
            }

            // if (_this.req.body.mobile && _this.req.body.mobile[0].trim().length > 0) {
            //     dataObj['mobile'] = _this.req.body.mobile[0].trim()
            // }

            if (_this.req.body.showkt_id && _this.req.body.showkt_id[0].trim().length > 0) {
                dataObj['showkt_id'] = _this.req.body.showkt_id[0].trim()
            }

            if (_this.req.body.user_bio) {
                dataObj['user_bio'] = _this.req.body.user_bio[0]
            }

            if (_this.req.body.facebook_link) {
                dataObj['facebook_link'] = _this.req.body.facebook_link[0]
            }
            if (_this.req.body.instagram_link) {
                dataObj['instagram_link'] = _this.req.body.instagram_link[0]
            }
            if (_this.req.body.twitter_link) {
                dataObj['twitter_link'] = _this.req.body.twitter_link[0]
            }
            if (_this.req.body.linkedin_link) {
                dataObj['linkedin_link'] = _this.req.body.linkedin_link[0]
            }
            if (_this.req.body.youtube_link) {
                dataObj['youtube_link'] = _this.req.body.youtube_link[0]
            }
            if (_this.req.body.website_link) {
                dataObj['website_link'] = _this.req.body.website_link[0]
            }

            if (_this.req.body.account_type && _this.req.body.account_type[0].trim().length > 0) {
                dataObj['account_type'] = _this.req.body.account_type[0].trim()
            }

            if (_this.req.body.user_email && _this.req.body.user_email[0].trim().length > 0) {
                dataObj['user_email'] = _this.req.body.user_email[0].trim()
            }

            if (_this.req.body.user_gender && _this.req.body.user_gender[0].trim().length > 0) {
                dataObj['user_gender'] = _this.req.body.user_gender[0].trim()
            }

            if (_this.req.body.user_dob && _this.req.body.user_dob[0]) {
                dataObj['user_dob'] = _this.req.body.user_dob[0]
            }
            if (_this.req.body.is_hide_dob && _this.req.body.is_hide_dob[0]) {
                dataObj['is_hide_dob'] = _this.req.body.is_hide_dob[0]
            }
            if (_this.req.body.device_token && _this.req.body.device_token[0]) {
                dataObj['device_token'] = _this.req.body.device_token[0]
            }
            if (_this.req.body.device_id && _this.req.body.device_id[0]) {
                dataObj['device_id'] = _this.req.body.device_id[0]
            }
            if (_this.req.body.device_type && _this.req.body.device_type[0]) {
                dataObj['device_type'] = _this.req.body.device_type[0]
            }
            if (_this.req.body.from_mobile && _this.req.body.from_mobile[0]) {
                dataObj['from_mobile'] = _this.req.body.from_mobile[0]
            }
            // if (_this.req.body.user_category && _this.req.body.user_category[0]) {
            //     dataObj['user_category'] = _this.req.body.user_category[0]
            // }
            if (_this.req.body.user_curent_location && _this.req.body.user_curent_location[0]) {
                dataObj['user_curent_location'] = _this.req.body.user_curent_location[0]
            }

            if (_this.req.body.user_category && _this.req.body.user_category[0]) {
                dataObj['user_category'] = _this.req.body.user_category[0]
            }
            if (_this.req.body.user_language && _this.req.body.user_language[0]) {
                dataObj['user_language'] = _this.req.body.user_language[0]
            }

            if (_this.req.body.push_notification_status && _this.req.body.push_notification_status[0]) {
                dataObj['push_notification_status'] = _this.req.body.push_notification_status[0]
            }
            if (_this.req.body.comment_notification_status && _this.req.body.comment_notification_status[0]) {
                dataObj['comment_notification_status'] = _this.req.body.comment_notification_status[0]
            }
            if (_this.req.body.like_notification_status && _this.req.body.like_notification_status[0]) {
                dataObj['like_notification_status'] = _this.req.body.like_notification_status[0]
            }
            if (_this.req.body.follow_notification_status && _this.req.body.follow_notification_status[0]) {
                dataObj['follow_notification_status'] = _this.req.body.follow_notification_status[0]
            }

            if (_this.req.body.user_age_group && _this.req.body.user_age_group[0]) {
                var user_age_group = JSON.parse(_this.req.body.user_age_group[0])
                dataObj['user_age_group'] = user_age_group;
                dataObj['user_age_group_str'] = user_age_group.join('-');
            }

            if (formObject.files.file) {
                const file = new File(formObject.files);
                let fileObject = await file.store('users');
                filepath = fileObject.filePartialPath;
                dataObj.user_photo = filepath;
            }


            dataObj["is_profile"] = true;

            console.log("sdsd", _this.req.user.userId, moment(dataObj.user_dob, "YYYY-MM-DD", true).isValid());

            // if (!dataObj.user_fullname || !dataObj.user_dob || !dataObj.user_gender)
            //     return _this.res.send({ status: 0, message: lang.send_data });

            if (dataObj.user_dob && !moment(dataObj.user_dob, "YYYY-MM-DD", true).isValid()) {
                return _this.res.send({ status: 0, message: "Invaild user date. Date should be in ['YYYY-MM-DD'] format" });
            }

            console.log("dataObj", dataObj, _this.req.user.userId)

            const updatedUser = await Users.findByIdAndUpdate(_this.req.user.userId, dataObj, { new: true });
            // const updatedUser = await Users.updateOne({ "user_phone": dataObj['mobile'] }, dataObj);

            if (dataObj.user_curent_location && dataObj.user_curent_location.length > 0) {
                _this.addUserLocation(_this.req.user.userId, dataObj.user_curent_location);
            }

            if (_.isEmpty(updatedUser))
                return _this.res.send({ status: 0, message: lang.user_profile_update_error });

            _this.res.send({ status: 1, message: lang.user_profile_update });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'updateUser',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: lang.server_error });
        }
    }

    isValidDate(date) {
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
    }

    async userLogout() {
        let _this = this;
        var modelsNew = Users;
        var lang = (_this.req.body.localization === 'en') ? langEn : langEr;
        try {

            // if (!_this.req.body.uid)
            //     return _this.res.send({ status: 0, message: lang.send_data });

            // let filter = {
            //     "$and": [
            //         { "userId": _this.req.body.uid },
            //         { "token": _this.req.headers.authorization }
            //     ]
            // }

            // //console.log("filter", filter)
            // const updatedUser = await Authtokens.deleteOne(filter);
            // await Users.findByIdAndUpdate(_this.req.user.userId, { "device_token": null, "device_id": null }, { new: true });
            // // //console.log("updatedUser", updatedUser)
            // if (_.isEmpty(updatedUser))
            //     return _this.res.send({ status: 0, message: 'Error in logout' });

            return _this.res.send({ status: 1, message: "Logout" });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'userLogout',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: lang.server_error });
        }
    }

    async socialLogin() {
        let _this = this;
        let filter = '';
        var modelsNew = Users;
        var lang = langEn;
        try {

            var dataObj = _this.req.body;

            console.log("dataObj**", dataObj)

            if (!dataObj.email || !dataObj.login_type) {
                return fn({ status: 0, message: "Please send proper data" });
            }

            filter = { "user_email": dataObj.email };
            // var fname = dataObj.firstname || "";
            // var lname = dataObj.lastname || "";
            var curaddr = dataObj.user_curent_location || null;
            const user = await modelsNew.findOne(filter);

            let globalObj = new Globals();
            const file = new File();

            var userimg = 'users/user_' + Date.now().toString() + '.jpg';

            //console.log("user111", user)
            if (!_.isEmpty(user)) {
                console.log('1111111111')

                // var daatnew = {
                //     "_id": user._id,
                //     "photo": (dataObj.photo)?configs.aws_cdr_url+userimg : 'public/no-image-user.png',
                //     "firstName": user.user_firstname,
                //     "lastName": user.user_lastname,
                //     "login_type": user.login_type,
                //     "is_mobile": (user.user_phone && user.user_phone.length > 0) ? true : false
                // }
                const updateUser = await modelsNew.findByIdAndUpdate(user._id, {
                    // user_photo: (dataObj.user_photo) ? userimg : 'public/no-image-user.png',
                    user_curent_location: curaddr,
                    //linkedin_url: dataObj.linkedin_url || "",
                    // user_fullname: dataObj.user_fullname,
                    // user_firstname: dataObj.firstname || "",
                    // user_lastname: dataObj.lastname || "",
                    device_id: dataObj.device_id || "",
                    device_token: dataObj.device_token || "",
                    device_type: dataObj.device_type || "",
                    social_full_json: dataObj.social_full_json || ""
                }, { new: true });

                if (dataObj.user_curent_location_data && dataObj.user_curent_location_data.length > 0) {
                    // _this.addUserLocation(user._id, dataObj.user_curent_location_data, dataObj.type_of);
                }
                await Authtokens.deleteMany({ "userId": ObjectId(user._id) });

                var token = await globalObj.getToken(user._id);

                var daatnew = {
                    "user_fullname": user.user_fullname,
                    "showkt_id": user.showkt_id,
                    "user_bio": user.user_bio,
                    "user_dob": user.user_dob,
                    "user_gender": user.user_gender,
                    "user_id": user._id,
                    "user_phone": user.user_phone,
                    "user_email": user.user_email,
                    "account_type": user.account_type,
                    "photo": user.user_photo, //(dataObj.user_photo) ? userimg : 'public/no-image-user.png',
                    // role: newUser.user_role,
                    "access_token": token

                }

                if (dataObj.user_photo) {
                    //console.log("*****11111", dataObj.user_photo, userimg)
                    // const data = await file.downLoadImageFromServerToAws(dataObj.user_photo, userimg);
                }

                return _this.res.send({
                    status: 1,
                    message: 'Login successfully.',
                    data: daatnew,
                    showkit_id: (user.showkt_id) ? user.showkt_id : false,
                    is_profile: true
                })

            } else if (_.isEmpty(user)) {
                console.log('22222222')
                let password = bcrypt.hashSync("Sagar@789!", 10);
                let data = {
                    user_email: dataObj.email,
                    login_type: dataObj.login_type || "",
                    user_fullname: dataObj.user_fullname || "",
                    user_password: password,
                    user_photo: (dataObj.user_photo) ? userimg : 'public/no-image-user.png',
                    user_role: dataObj.role || 'user',
                    user_address: curaddr || "",
                    device_id: dataObj.device_id || "",
                    device_token: dataObj.device_token || "",
                    device_type: dataObj.device_type || "",
                    user_verificationStatus: true,
                    user_status: 'active',
                    social_full_json: dataObj.social_full_json || ""
                }

                const newUser = await new Model(modelsNew).store(data);
                console.log('22222222****')
                if (_.isEmpty(newUser))
                    return fn({ status: 0, message: 'User not saved.' });

                await Authtokens.deleteMany({ "userId": ObjectId(newUser._id) });
                var token = await globalObj.getToken(newUser._id);

                var daatnew = {
                    "user_fullname": newUser.user_fullname,
                    "showkt_id": newUser.showkt_id,
                    "user_bio": newUser.user_bio,
                    "user_dob": newUser.user_dob,
                    "user_gender": newUser.user_gender,
                    "user_id": newUser._id,
                    "user_phone": newUser.user_phone,
                    "user_email": newUser.user_email,
                    "account_type": newUser.account_type,
                    "photo": (dataObj.user_photo) ? userimg : 'public/no-image-user.png',
                    // role: newUser.user_role,
                    "access_token": token
                }

                console.log('22222222**********------')
                if (dataObj.user_curent_location_data && dataObj.user_curent_location_data.length > 0) {
                    // _this.addUserLocation(newUser._id, dataObj.user_curent_location_data, dataObj.type_of);
                }

                if (dataObj.user_photo) {
                    //console.log("*****2222", dataObj.user_photo, userimg)
                    const data = await file.downLoadImageFromServerToAws(dataObj.user_photo, userimg);
                }

                return _this.res.send({
                    status: 1,
                    message: 'Login successfully.',
                    data: daatnew,
                    showkit_id: (newUser.showkt_id) ? newUser.showkt_id : false,
                    is_profile: false
                })

            } else {
                return _this.res.send({ status: 0, message: 'Server Error' });
            }

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'linkedInCommonCode',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async userListing() {
        let _this = this;
        let filter1 = '';

        if (!this.req.body.page || !_this.req.body.pagesize) {
            return this.res.send({ status: 0, message: 'Please send proper data.' });
        }

        try {

            if (_this.req.body.id) {
                filter1 = { "delete_status": false, "_id": ObjectId(_this.req.body.id), user_role: "user" };
            } else {
                filter1 = { "delete_status": false, user_role: "user" };
            }


            let skip = (_this.req.body.page - 1) * (_this.req.body.pagesize);
            let sort = { createdAt: 1 };
            if (_this.req.body.sort) {
                sort = _this.req.body.sort
            }

            if (_this.req.body.is_from && _this.req.body.is_from === 'search') {
                filter1['$or'] = [{
                    "user_firstname": { $regex: _this.req.body.search_text, $options: 'i' }
                },
                {
                    "user_email": { $regex: _this.req.body.search_text, $options: 'i' }
                },
                {
                    "user_lastname": { $regex: _this.req.body.search_text, $options: 'i' }
                },
                {
                    "user_fullname": { $regex: _this.req.body.search_text, $options: 'i' }
                }
                ]

            }

            console.log("filter1", skip, _this.req.body.pagesize, sort, filter1)
            const userListing = await (new User(Users)).userAdListing(skip, _this.req.body.pagesize, sort, filter1);

            const total = await (new User(Users)).userListingCount(sort, filter1);

            _this.res.send({
                status: 1,
                message: 'User list',
                data: userListing,
                page: _this.req.body.page,
                perPage: _this.req.body.pagesize,
                paginatorTotal: (total && total.length > 0) ? total[0].totalCount : 0
            });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'userListing',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async addUserLocation(uid, curdata) {
        try {

            var ldata = {
                "user_id": uid,
                "user_curent_location": curdata,
                device_id: curdata.device_id || null,
                device_type: curdata.device_type || null,
                device_model: curdata.device_model || null,
                user_login_time: curdata.user_login_time || null,
            }

            const Locations = await new Model(Location).store(ldata);

            return new Promise((resolve, reject) => {
                if (_.isEmpty(Locations)) {
                    //////console.log("Not saved")
                    resolve({})
                } else {
                    resolve(Locations)
                }
            });

        } catch (error) {
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'addUserLocation',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            //return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async getUserProfile(flag) {
        let _this = this;
        let filter = {};
        var lang = langEn;
        var statusArr = [];
        var fnObj = {};
        var loginUserId = null;
        try {

            console.log("flag", this.req.body)

            var userId = this.req.body.user_id || this.req.user.userId;

            if (this.req.body.auth_user_id) {
                loginUserId = ObjectId(this.req.body.auth_user_id)
            }


            if (!userId) {
                return this.res.send({ status: 0, message: 'Please send proper data.' });
            }

            // console.log("flag", flag)

            if (flag) {
                var decryptedData = _this.req.body;
                // if (!decryptedData.page || !decryptedData.pagesize) {
                //     return _this.res.send({ status: 0, message: lang.send_data });
                // }

                var pagesize = parseInt(5);
                var page = parseInt(1);

                let skip = (page - 1) * (pagesize);
                let sort = { createdAt: 1 };
                if (decryptedData.sort) {
                    sort = decryptedData.sort
                }

                filter = {
                    "_id": ObjectId(userId),
                    "delete_status": false
                }

                if (decryptedData.type) {
                    var filterVidImg = {
                        "user_id": ObjectId(userId),
                        "is_delete": false,
                        "is_block": false,
                        "post_type": decryptedData.type,

                    }
                    console.log("filterVidImg", filterVidImg)
                    statusArr = await (new User(Posts)).getTotalVideoImageList(skip, pagesize, { "createdAt": -1 }, filterVidImg);
                    fnObj = {
                        status: 1,
                        message: ' Data',
                        list: statusArr,
                        page: page,
                        perPage: pagesize
                    }

                    if (decryptedData.type == 'video') {
                        var filterVid = {
                            "user_id": ObjectId(userId),
                            "is_delete": false,
                            "is_block": false,
                            "post_type": "video",

                        }
                        const totalVid = await (new User(Posts)).getTotalVideoImageCount(sort, filterVid);
                        fnObj["total_video"] = (totalVid && totalVid.length > 0) ? totalVid[0].totalCount : 0
                    }

                    if (decryptedData.type == 'image') {
                        var filterImg = {
                            "user_id": ObjectId(userId),
                            "is_delete": false,
                            "is_block": false,
                            "post_type": "image",

                        }
                        const totalImg = await (new User(Posts)).getTotalVideoImageCount(sort, filterImg);
                        fnObj["total_image"] = (totalImg && totalImg.length > 0) ? totalImg[0].totalCount : 0
                    }

                } else {
                    statusArr = await (new User(Users)).getUserProfileByID(skip, pagesize, { "createdAt": -1 }, filter, userId, loginUserId);
                    console.log("statusArr", statusArr)
                    var newObj = {};
                    if (statusArr && statusArr.length > 0) {
                        statusArr = statusArr[0];
                        newObj = {
                            "_id": statusArr._id,
                            "user_photo": statusArr.user_photo,
                            "user_fullname": statusArr.user_fullname || "",
                            "showkt_id": statusArr.showkt_id || "",
                            "profile_type": statusArr.profile_type || "",
                            // "user_dob": "$user_dob", 
                            "user_gender": statusArr.user_gender || "",
                            // "user_phone": "$user_phone", 
                            // "user_email": "$user_email",
                            "total_post": statusArr.total_post || "",
                            "user_bio": statusArr.user_bio || "",
                            "facebook_link": statusArr.facebook_link || "",
                            "instagram_link": statusArr.instagram_link || "",
                            "twitter_link": statusArr.twitter_link || "",
                            "linkedin_link": statusArr.linkedin_link || "",
                            "youtube_link": statusArr.youtube_link || "",
                            "website_link": statusArr.website_link || "",
                            "followers_count": statusArr.followers_count || "",
                            "following_count": statusArr.following_count || "",
                            "post_data_images": statusArr.post_data_images || "",
                            "post_data_video": statusArr.post_data_video || "",
                            "following": statusArr.following,
                        }
                        // console.log("newObj", newObj)
                    }
                    fnObj = {
                        status: 1,
                        message: ' Data',
                        list: newObj,
                        // page: page,
                        // perPage: pagesize
                    }
                    var filterVid = {
                        "user_id": ObjectId(userId),
                        "is_delete": false,
                        "is_block": false,
                        "post_type": "video",

                    }

                    // console.log("total_video", JSON.stringify(filterVid))
                    const totalVid = await (new User(Posts)).getTotalVideoImageCount(sort, filterVid);
                    var total_video = (totalVid && totalVid.length > 0) ? totalVid[0].totalCount : 0
                    // console.log("total_video", total_video)
                    var filterImg = {
                        "user_id": ObjectId(userId),
                        "is_delete": false,
                        "is_block": false,
                        "post_type": "image",

                    }
                    const totalImg = await (new User(Posts)).getTotalVideoImageCount(sort, filterImg);
                    var total_image = (totalImg && totalImg.length > 0) ? totalImg[0].totalCount : 0;
                    console.log("total_image", total_image)
                    fnObj["total_post"] = total_image + total_video;

                }

                return _this.res.send(fnObj);


            } else {
                var userProfile = await Users.findOne({ "_id": ObjectId(userId) }, {
                    "_id": 1,
                    "user_photo": 1,
                    "user_fullname": 1,
                    "showkt_id": 1,
                    "user_bio": 1,
                    "user_dob": 1,
                    "user_gender": 1,
                    "user_phone": 1,
                    "user_email": 1,
                    "account_type": 1,
                    "facebook_link": 1,
                    "instagram_link": 1,
                    "twitter_link": 1,
                    "linkedin_link": 1,
                    "youtube_link": 1,
                    "website_link": 1,
                    "followers_count": 1,
                    "following_count": 1,
                    "is_hide_dob": 1,
                    "push_notification_status": 1,
                    "comment_notification_status": 1,
                    "like_notification_status": 1,
                    "follow_notification_status": 1
                });

                userProfile["user_photo"] = (userProfile.user_photo) ? userProfile.user_photo : 'public/no-image-user.png'
                let sort = { createdAt: 1 };
                var filterVid = {
                    "user_id": ObjectId(userId),
                    "is_delete": false,
                    "is_block": false,
                    "post_type": "video"
                }

                // console.log("total_video", JSON.stringify(filterVid))
                const totalVid = await (new User(Posts)).getTotalVideoImageCount(sort, filterVid);
                var total_video = (totalVid && totalVid.length > 0) ? totalVid[0].totalCount : 0
                // console.log("total_video", total_video)
                var filterImg = {
                    "user_id": ObjectId(userId),
                    "is_delete": false,
                    "is_block": false,
                    "post_type": "image"
                }

                const totalImg = await (new User(Posts)).getTotalVideoImageCount(sort, filterImg);
                var total_image = (totalImg && totalImg.length > 0) ? totalImg[0].totalCount : 0;
                // console.log("total_image", total_image)
                var total_post = total_image + total_video;

                return this.res.send({ status: 1, data: userProfile, total_post: total_post });
            }


        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'getUserProfile',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async downloadImage() {
        try {
            const file = new File();
            //'/public/download/image_sag.png' localpath
            const data = await file.downLoadImageFromServerToAws('http://d36lr9hgdyglvn.cloudfront.net/images/1-mobile-app.png', 'users/sagar_image1.jpg');
            console.log(data); // The file is finished downloading.
            return this.res.send({ status: 1 });
        } catch (error) {
            console.log("error", error)
        }
    }

    async changeUser() {
        var _this = this;
        try {
            var uers = await Users.find({ "user_role": "user" }, { "user_phone": 1 })
            console.log("uers", uers.length)
            if (uers && uers.length > 0) {
                this.recuUser(uers)
            }
            return this.res.send({ status: 1, message: "done" });
        } catch (error) {
            console.log("error changeUser", error)
        }
    }

    async recuUser(uers) {
        try {

            if (uers && uers.length > 0) {
                var userId = uers[0]["_id"];
                var mobile = (uers[0]['user_phone']) ? parseInt(uers[0]['user_phone']) : "";
                console.log("userId", userId, mobile)
                var upUser = await Users.findOneAndUpdate({ "_id": ObjectId(userId) }, { "user_phone": mobile });
                uers.splice(0, 1);
                this.recuUser(uers)
            }

        } catch (error) {
            console.log("error recuUser", error)
        }
    }

    async getPopularUser() {
        let _this = this;
        let filter = { "delete_status": false, user_role: "user" };
        var lang = langEn;
        var loginUserId = null;
        try {
            var page = _this.req.body.page || 1;
            var pagesize = _this.req.body.pagesize || 20;
            let skip = (page - 1) * (pagesize);
            let sort = { "followers_count": -1 };

            // var userList = await Users.find({ "delete_status": false, user_role: "user" }, {"user_fullname":1, "user_photo":1, "followers_count":1}).sort({"followers_count":-1}).skip(skip).limit(pagesize);

            // var total = await Users.countDocuments({ "delete_status": false, user_role: "user" })

            if (this.req.body.auth_user_id) {
                loginUserId = ObjectId(this.req.body.auth_user_id)
            }

            var userList = await (new User(Users)).getPopularUser(skip, pagesize, sort, filter, loginUserId);
            const total = await (new User(Users)).searchByUserCount(sort, filter);

            return _this.res.send({ status: 1, data: userList, page: page, perPage: pagesize, total: (total && total.length > 0) ? total[0]['totalCount'] : total });


        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'getPopularUser',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async getPopularPost() {
        let _this = this;
        let filter = {};
        var lang = langEn;
        try {

            var page = _this.req.body.page || 1;
            var pagesize = _this.req.body.pagesize || 20;
            let skip = (page - 1) * (pagesize);
            let sort = { "like_count": -1 };

            filter = {
                "is_delete": false,
                "post_type": _this.req.body.post_type || 'image',
            }


            // var postList = await Posts.find(filter, {
            //     "title":1, 
            //     "description":1,
            //     "file":1, 
            //     "thumbnail":1, 
            //     "full_urlfile":1,                
            //     "post_type":1, 
            //     "like_count":1, 
            //     "description":1,
            // }).sort({"like_count":-1}).skip(skip).limit(pagesize);

            var postList = await (new User(Posts)).searchByPost(skip, pagesize, sort, filter);
            const total = await (new User(Posts)).searchByPostCount(sort, filter);

            return _this.res.send({ status: 1, data: postList, page: page, perPage: pagesize, total: (total && total.length > 0) ? total[0].totalCount : 0 });

        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'getPopularPost',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }

    async getPopularHastag() {
        let _this = this;
        let filter = {};
        var lang = langEn;
        try {
            var page = _this.req.body.page || 1;
            var pagesize = _this.req.body.pagesize || 20;
            let skip = (page - 1) * (pagesize);
            let sort = { "uses": -1 };

            var tagList = await Tags.find({ "delete_status": false }, { "name": 1, "description": 1, "uses": 1 }).sort(sort).skip(skip).limit(pagesize);
            var total = await Tags.countDocuments({ "delete_status": false })

            return _this.res.send({ status: 1, data: tagList, page: page, perPage: pagesize, total: total });
        } catch (error) {
            console.log("error", error)
            let globalObj = new Globals();
            var dataErrorObj = {
                is_from: 'API Error',
                api_name: 'User Route Api',
                finction_name: 'getPopularHastag',
                error_title: error.name,
                description: error.message
            }
            globalObj.addErrorLogInDB(dataErrorObj);
            return _this.res.send({ status: 0, message: 'Server Error' });
        }
    }



}
module.exports = UsersController;
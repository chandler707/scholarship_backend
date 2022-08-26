const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Users = require("../models/UserSchema").Users;
const Authtokens = require("../models/AuthenticationSchema").Authtokens;
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
let Form = require("../services/Form");
let File = require("../services/File");
<<<<<<< HEAD
=======
const UserPreferances = require("../models/UserPreferanceSchema").UserPreferances;
const UserProfiles = require("../models/UserProfileSchema").UserProfiles;
const https = require("https");
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
var randomstring = require("randomstring");
const moment = require("moment");
const Aggregation = require("../models/Aggregation");
<<<<<<< HEAD
const bcrypt = require("bcrypt");
const EducationDetails =
  require("../models/EducationDetailSchema").EducationDetails;

const TestScore = require("../models/TestScoreSchema").TestScore;
const UniversityDetails =
  require("../models/UniversityDetail").UniversityDetails;
=======
const UserImages = require("../models/UserImagesSchema").UserImages;
const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'google',
  // Optional depending on the providers
  // fetch: customFetchImplementation,
  apiKey: 'AIzaSyCqnGVf4ELk_GRC6CQ1hqwo7BBLIO_49qI', // for Mapquest, OpenCage, Google Premier
  // formatter: null // 'gpx', 'string', ...
};
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab

class UsersController extends Controller {
  constructor() {
    super();
  }

<<<<<<< HEAD
=======
  async getAllSettings() {
    var _this = this;
    try {
      var settingData = await Settings.find({});
      return _this.res.send({ status: 1, data: settingData });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "getAllSettings",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async checkEmailExist() {
    let _this = this;
    var modelsNew = Users;

    try {

      //console.log("_this.req.body", _this.req.body) 

      if (!_this.req.body.email)
        return _this.res.send({ status: 0, message: 'Please send proper data.' });

      let emailId = _this.req.body.email.toLowerCase();

      let globalObj = new Globals();
      const tokenEmail = await globalObj.generateToken(emailId, 180); //180 = 3*60 (3 min)

      let user = await modelsNew.findOne({ "user_email": emailId }, { "user_email": 1, "user_firstname": 1, "user_fullname": 1 });

      if (_.isEmpty(user))
        return _this.res.send({ status: 1, message: 'This email is not register on our portal' });

      return _this.res.send({ status: 0, message: 'This email is already register on our portal' });



    } catch (error) {

      console.log("error", error)

      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: 'API Error',
        api_name: 'User Route Api',
        finction_name: 'checkEmailExist',
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

      var mob = parseInt(_this.req.body.mobile);
      console.log("mob", mob);
      const file = new File();
      var checkMonExst = await this.checkMobileExistFn({ mobile: mob });
      console.log("checkMonExst", checkMonExst);
      if (checkMonExst.status === 0) {
        if (mob == 5089062001) {
          var code = "1908";
          _this.req.body["otp"] = code;
        } else {
          var code = randomstring.generate({ length: 4, charset: "numeric" });
          _this.req.body["otp"] = code;
          let mobOTP = await file.sendOTP(_this.req.body);
        }

        let dataObj = {
          user_phone: mob,
          country_code: _this.req.body.country_code,
          otp: code,
        };
        const newUser = await new Model(Users).store(dataObj);
        if (_.isEmpty(newUser))
          return _this.res.send({ status: 0, message: lang.error_save_data });
        return _this.res.send({ status: 1, message: lang.otp_sent });
      } else {
        this.resendOtpFn(_this.req.body, function (res) {
          _this.res.send(res);
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "sendOtp",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async resendOtp() {
    var _this = this;
    try {
      this.resendOtpFn(_this.req.body, function (res) {
        _this.res.send(res);
      });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "resendOtp",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async resendOtpFn(dataObj, fn) {
    let _this = this;
    var lang = langEn;

    try {
      if (!dataObj.mobile || !dataObj.country_code)
        return fn({ status: 0, message: lang.send_data });

      let user_phone = parseInt(dataObj.mobile);

      let newUser = await Users.findOne(
        { user_phone: user_phone },
        { user_phone: 1, otp_increement: 1 }
      );

      if (_.isEmpty(newUser))
        return fn({ status: 0, message: lang.user_not_exist });

      if (newUser.otp_increement > 9) {
        return fn({ status: 1, message: lang.max_otp_send });
      }

      if (dataObj.mobile == 5089062001) {
        var otpCode = "1908";
        _this.req.body["otp"] = otpCode;
      } else {
        var otpCode = "1234"; //randomstring.generate({ length: 4, charset: 'numeric' })
        dataObj["otp"] = otpCode;
        const file = new File();
        let mobOTP = await file.sendOTP(dataObj);
      }

      let updateUser = await Users.findByIdAndUpdate(
        newUser._id,
        { otp: otpCode, $inc: { otp_increement: 1 } },
        { new: true }
      );

      return fn({ status: 1, message: lang.otp_sent });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "resendOtpFn",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return fn({ status: 0, message: "Server Error" });
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
        user_phone: user_phone,
        otp: "1234", //dataObj.otp
      };
      let newUser = await Users.findOne(otpObj);

      // console.log("newUser", newUser)
      if (newUser) {
        var a = moment(); //now
        var b = moment(newUser.updatedAt);

        if (a.diff(b, "minutes") > 15)
          return _this.res.send({ status: 0, message: lang.otp_expired });

        console.log("dsdsdsd", a.diff(b, "minutes"));
        var curDate = new Date();
        var upataObj = {
          //otp: "",
          user_status: "active",
          user_verificationStatus: true,
          device_id: dataObj.device_id || "",
          device_type: dataObj.device_type || "",
          device_token: dataObj.device_token || "",
          user_curent_location: dataObj.user_curent_location || "",
          user_login_time: curDate,
          otp_increement: 0,
        };
        let updateUser = await Users.findByIdAndUpdate(newUser._id, upataObj);
        // var tokelDelMany = await Authtokens.deleteMany({ "userId": ObjectId(newUser._id) });
        let globalObj = new Globals();
        const token = await globalObj.getToken(newUser._id);
        let data = {
          user_fullname: newUser.user_fullname,
          showkt_id: newUser.showkt_id,
          user_bio: newUser.user_bio,
          user_dob: newUser.user_dob,
          user_gender: newUser.user_gender,
          user_id: newUser._id,
          user_phone: newUser.user_phone,
          user_email: newUser.user_email,
          account_type: newUser.account_type,
          photo: newUser.user_photo || "public/no-image-user.png",
          // role: newUser.user_role,
          access_token: token,
        };
        // if (dataObj.user_curent_location && dataObj.user_curent_location.length > 0) {
        //     _this.addUserLocation(newUser._id, dataObj.user_curent_location);
        // }
        _this.addUserLocation(newUser._id, upataObj);
        return _this.res.send({
          status: 1,
          message: lang.user_verify,
          data: data,
          showkit_id: newUser.showkt_id ? newUser.showkt_id : false,
          is_profile: newUser.is_profile ? newUser.is_profile : false,
        });
      } else {
        return _this.res.send({ status: 0, message: lang.otp_not_match });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "otpVerify",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
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
        pass_auth_key: passAuth,
      };

      // console.log("upataObj", upataObj)
      let updateUser = await Users.findByIdAndUpdate(
        _this.req.user.userId,
        upataObj
      );

      if (_.isEmpty(updateUser))
        return _this.res.send({ status: 0, message: "Error in add passcode" });

      _this.res.send({ status: 1, message: "Passcode added" });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "addUpdatePasscode",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async signinPasscode() {
    var _this = this;
    var lang = langEn;
    try {
      if (!_this.req.user.userId && !_this.req.body.passcode)
        return _this.res.send({ status: 0, message: lang.send_data });

      var userData = await Users.findOne({
        _id: _this.req.user.userId,
        pass_code: _this.req.body.passcode,
      });

      // console.log("userData", userData)
      if (_.isEmpty(userData))
        return _this.res.send({ status: 0, message: "Wrong passcode" });

      // var tokelDelMany = await Authtokens.deleteMany({ "userId": ObjectId(userData._id) });
      let globalObj = new Globals();
      const token = await globalObj.getToken(userData._id);

      let data = {
        user_fullname: userData.user_fullname,
        showkt_id: userData.showkt_id,
        user_bio: userData.user_bio,
        user_dob: userData.user_dob,
        user_gender: userData.user_gender,
        user_id: userData._id,
        user_phone: userData.user_phone,
        user_email: userData.user_email,
        account_type: userData.account_type,
        photo: userData.user_photo || "public/no-image-user.png",
        access_token: token,
      };
      _this.res.send({
        status: 1,
        message: lang.login_success,
        data: data,
        showkit_id: userData.showkt_id ? userData.showkt_id : false,
      });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "verifyPasscode",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  checkMobileExistFn(obj) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("obj.mobile", obj.mobile);
        var checMobile = await Users.findOne(
          { user_phone: obj.mobile },
          { user_phone: 1 }
        );
        console.log("checMobile", checMobile);
        if (_.isEmpty(checMobile)) {
          resolve({ status: 0, message: "User is not exist." });
        } else {
          resolve({ status: 1, data: checMobile });
        }
      } catch (error) {
        console.log("error", error);
        reject({ status: 0, message: "User is not exist." });
      }
    });
  }

  getDate(data) {
    var today = new Date(data);
    //////console.log(today.getFullYear()+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+("0" + (today.getDate())).slice(-2)+"T00:00:00.000Z")
    ////////console.log(today,("0" + (today.getDate())).slice(-2)+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+today.getFullYear())
    // return ("0" + (today.getDate())).slice(-2)+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+today.getFullYear()+ "00:00:00";
    return (
      today.getFullYear() +
      "-" +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + today.getDate()).slice(-2) +
      "T00:00:00.000Z"
    );
  }

  getFullName(first, last) {
    if (first || last) {
      return first + " " + last;
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

>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
  async UserSignIn() {
    console.log("hit");
    let _this = this;
    var filter = {};
    try {
      var loginData = _this.req.body;
<<<<<<< HEAD
      if (!loginData.email)
        return _this.res.send({
          status: 0,
          message: "please send email",
        });
      if (!loginData.user_type)
        return _this.res.send({
          status: 0,
          message: "please send user type",
        });

      filter = {
        email: loginData.email.trim(),
        user_type: loginData.user_type,
      };
      let user = await Users.findOne(filter).lean();
=======
      // console.log('******', loginData);

      if (!loginData.email || !loginData.password)
        return _this.res.send({ status: 0, message: lang.send_data });

      filter = { user_email: loginData.email.trim().toLowerCase() };

      // let user = await Users.findOne(filter).lean();
      let user = await Users.aggregate([
        {
          $match: filter
        },
        {
          $lookup: {
            from: 'user_preferances',
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"]
                  }
                }
              },
              // { $project: { _id: 1, company_name: 1 } }
            ],
            as: 'user_preferances',
          }
        },
        {
          $unwind: {
            path: "$user_preferances",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            "_id": 1,
            "user_email": 1,
            "user_verificationStatus": 1,
            "user_password": 1,
            "user_status": 1,
            "device_id": 1,
            "device_token": 1,
            "device_type": 1,
            "is_hide_dob": 1,
            "login_type": 1,
            "location_type": "$user_preferances.location_type",
            "preferred_age_from": "$user_preferances.preferred_age_from",
            "preferred_age_to": "$user_preferances.preferred_age_to",
            "search_preferred_radius": "$user_preferances.search_preferred_radius"
          }
        }
      ]);
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab

      if (_.isEmpty(user))
        return _this.res.send({ status: 2, message: "user doesn't exist" });

      if (!loginData.password)
        return _this.res.send({
          status: 0,
          message: "please send password",
        });
      let passVerify = await bcrypt.compare(loginData.password, user.password);
      console.log("status", passVerify);
      if (!passVerify)
        return _this.res.send({ status: 0, message: "wrong password" });

<<<<<<< HEAD
      if (!user.is_approved)
        return _this.res.send({
          status: 0,
          message: "Account Approval is pending",
        });
=======
      // console.log("user", user)
      user = user[0]
      // return false;

      const status = await bcrypt.compare(
        loginData.password.toString(),
        user.user_password
      );
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab

      let globalObj = new Globals();
      const token = await globalObj.getToken(user._id);

      console.log(token);
      user["token"] = token;

      _this.res.send({
        status: 1,
        message: langEn.login_success,
        data: user,
      });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "userSignIn",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: lang.server_error });
    }
  }

  async Register() {
    let _this = this;
    try {
<<<<<<< HEAD
      let bodyData = _this.req.body;
      console.log("bodyData", bodyData);

      if (!bodyData.email) {
        return _this.res.send({ status: 0, message: "please send email" });
=======
      // console.log("res")
      // const geocoder = NodeGeocoder(options);
      // const res = await geocoder.geocode('kalyen gnaj bassi jaipur 303301');
      // console.log("res", JSON.stringify(res))
      // return false;

      let form = new Form(_this.req);
      let formObject = await form.parse();
      // console.log("form data", formObject);
      // console.log("form data field", formObject.fields);
      _this.req.body = formObject.fields;

      var dataObj = {};
      var userProfile = {};
      var preferObj = {};
      var imageObj = { "is_profile_image": true };

      if (
        _this.req.body.first_name &&
        _this.req.body.first_name[0].trim().length > 0
      ) {
        userProfile["first_name"] = _this.req.body.first_name[0].trim();
      }

      if (
        _this.req.body.last_name &&
        _this.req.body.last_name[0].trim().length > 0
      ) {
        userProfile["last_name"] = _this.req.body.last_name[0].trim();
      }

      if (
        _this.req.body.about_me &&
        _this.req.body.about_me[0].trim().length > 0
      ) {
        userProfile["about_me"] = _this.req.body.about_me[0].trim();
      }

      if (
        _this.req.body.city &&
        _this.req.body.city[0].trim().length > 0
      ) {
        userProfile["city"] = _this.req.body.city[0].trim();
      }

      if (
        _this.req.body.state &&
        _this.req.body.state[0].trim().length > 0
      ) {
        userProfile["state"] = _this.req.body.state[0].trim();
      }

      if (
        _this.req.body.country &&
        _this.req.body.country[0].trim().length > 0
      ) {
        userProfile["country"] = _this.req.body.country[0].trim();
      }

      if (
        _this.req.body.post_code &&
        _this.req.body.post_code[0].trim().length > 0
      ) {
        userProfile["post_code"] = _this.req.body.post_code[0].trim();
      }

      if (
        _this.req.body.address &&
        _this.req.body.address[0].trim().length > 0
      ) {
        userProfile["address"] = _this.req.body.address[0].trim();
      }


      if (
        _this.req.body.username &&
        _this.req.body.username[0].trim().length > 0
      ) {
        dataObj["username"] = _this.req.body.username[0].trim();
      }

      if (
        _this.req.body.user_email &&
        _this.req.body.user_email[0].trim().length > 0
      ) {
        dataObj["user_email"] = _this.req.body.user_email[0].trim().toLowerCase();
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
      }
      if (!bodyData.user_type) {
        return _this.res.send({ status: 0, message: "please send user type" });
      }
      let email = bodyData.email;
      let isExist = await Users.findOne({ email: email });
      console.log("exist", isExist);

<<<<<<< HEAD
      if (!_.isEmpty(isExist)) {
=======
      if (
        _this.req.body.user_password &&
        _this.req.body.user_password[0].trim().length > 0
      ) {
        let password = bcrypt.hashSync(
          _this.req.body.user_password[0].trim(),
          10
        );

        dataObj["user_password"] = password;
      }

      if (
        _this.req.body.user_gender &&
        _this.req.body.user_gender[0].trim().length > 0
      ) {
        userProfile["user_gender"] = _this.req.body.user_gender[0].trim();
        preferObj["user_gender"] = _this.req.body.user_gender[0].trim();
      }
      if (_this.req.body.user_dob && _this.req.body.user_dob[0]) {
        userProfile["user_dob"] = _this.req.body.user_dob[0];
        let birthYear = parseInt(_this.req.body.user_dob[0].split("-")[0]);
        let currentYear = new Date().getFullYear();
        let userAge = currentYear - birthYear;
        preferObj["user_age"] = userAge;
      }

      if (_this.req.body.is_hide_dob && _this.req.body.is_hide_dob[0]) {
        dataObj["is_hide_dob"] = _this.req.body.is_hide_dob[0];
      }
      // if (_this.req.body.device_token && _this.req.body.device_token[0]) {
      //   dataObj["device_token"] = _this.req.body.device_token[0];
      // }
      if (_this.req.body.from_mobile && _this.req.body.from_mobile[0]) {
        dataObj["from_mobile"] = _this.req.body.from_mobile[0];
      }

      if (!dataObj.user_email || !dataObj.user_password)
        return this.res.send({ status: 0, message: lang.send_data });

      if (
        dataObj.user_dob &&
        !moment(dataObj.user_dob, "YYYY-MM-DD", true).isValid()
      ) {
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
        return _this.res.send({
          status: 2,
          message: "you is already registered ..please login",
        });
<<<<<<< HEAD
      } else {
        let dataObj = {};
        if (bodyData.user_type === "student") {
          if (!bodyData.name || !bodyData.mobile || !bodyData.password) {
            return _this.res.send({
              status: 0,
              message: "please fill required fields",
            });
=======
      }

      filter = { user_email: _this.req.body.user_email };
      var user = await modelsNew.findOne(filter);

      if (!_.isEmpty(user)) {
        return _this.res.send({ status: 0, message: "user already exist" });
      }
      if (_.isEmpty(user)) {
        // console.log(formObject);


        // if (formObject.files.user_profile) {
        //   const file = new File(formObject.files.user_profile);
        //   let fileObject = await file.store("users_image");
        //   var filepath = fileObject.filePartialPath;
        //   imageObj.image_name = filepath;
        // }

        console.log("dataObj", dataObj);

        dataObj["user_email"] = dataObj["user_email"].toLowerCase();
        dataObj["role_id"] = ObjectID("62ce5d008bedfd0283a56ccd");
        // dataObj["is_hide_dob"] = dataObj.is_hide_dob && dataObj.is_hide_dob == "true" ? true : false;

        const newUser = await new Model(modelsNew).store(dataObj);
        if (_.isEmpty(newUser)) {
          return _this.res.send({ status: 0, message: lang.error_save_data });
        }

        if (formObject.files) {
          var fileKeys = Object.keys(formObject.files)
          var ss = await this.imageUploadFn(fileKeys, formObject.files, newUser._id);
        }

        imageObj["image_name"] = imageObj.image_name || "/public/no-image-user.png";
        imageObj["user_id"] = newUser._id;

        var location = { type: "Point", coordinates: [] };

        if (
          _this.req.body.search_preferred_gender &&
          _this.req.body.search_preferred_gender[0]
        ) {
          preferObj["search_preferred_gender"] =
            _this.req.body.search_preferred_gender[0];
        }

        if (
          _this.req.body.search_preferred_radius &&
          _this.req.body.search_preferred_radius[0]
        ) {
          preferObj["search_preferred_radius"] =
            _this.req.body.search_preferred_radius[0];
        }

        if (
          _this.req.body.location_type &&
          _this.req.body.location_type[0]
        ) {
          preferObj["location_type"] =
            _this.req.body.location_type[0];
        }

        if (
          _this.req.body.is_radius_from_location &&
          _this.req.body.is_radius_from_location[0]
        ) {
          preferObj["is_radius_from_location"] =
            _this.req.body.is_radius_from_location[0];
        }
        if (
          _this.req.body.is_radius_from_current_location &&
          _this.req.body.is_radius_from_current_location[0]
        ) {
          preferObj["is_radius_from_current_location"] =
            _this.req.body.is_radius_from_current_location[0];
        }
        if (
          _this.req.body.preferred_age_from &&
          _this.req.body.preferred_age_from[0]
        ) {
          preferObj["preferred_age_from"] =
            _this.req.body.preferred_age_from[0];
        }
        if (
          _this.req.body.preferred_age_to &&
          _this.req.body.preferred_age_to[0]
        ) {
          preferObj["preferred_age_to"] = _this.req.body.preferred_age_to[0];
        }
        if (_this.req.body.location_long && _this.req.body.location_long[0]) {
          location.coordinates.push(
            parseFloat(JSON.parse(_this.req.body.location_long[0]))
          );
        }
        if (_this.req.body.location_lat && _this.req.body.location_lat[0]) {
          if (location.coordinates.length > 0) {
            location.coordinates.push(
              parseFloat(JSON.parse(_this.req.body.location_lat[0]))
            );
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
          }
          dataObj["email"] = bodyData.email.trim();

          dataObj["name"] = bodyData.name.trim();

          dataObj["mobile"] = bodyData.mobile.trim();

          let bodyPass = bodyData.password.trim();
          let hashPass = await bcrypt.hash(bodyPass, 10);
          dataObj["password"] = hashPass;
          dataObj["user_type"] = bodyData.user_type;
          dataObj["is_approved"] = true;
        }
        if (bodyData.user_type === "university") {
          if (
            !bodyData.name ||
            !bodyData.mobile ||
            !bodyData.country ||
            !bodyData.state ||
            !bodyData.official_website ||
            !bodyData.password
          ) {
            return _this.res.send({
              status: 0,
              message: "please fill required fields",
            });
          }
          dataObj["email"] = bodyData.email.trim();

<<<<<<< HEAD
          dataObj["name"] = bodyData.name.trim();
=======
        preferObj["is_radius_from_location"] =
          preferObj.is_radius_from_location &&
            dataObj.is_radius_from_location == "true"
            ? true
            : false;
        preferObj["is_radius_from_current_location"] =
          preferObj.is_radius_from_current_location &&
            dataObj.is_radius_from_current_location == "true"
            ? true
            : false;
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab

          dataObj["mobile"] = bodyData.mobile;
          dataObj["country"] = bodyData.country;
          dataObj["state"] = bodyData.state;
          dataObj["official_website"] = bodyData.official_website.trim();

<<<<<<< HEAD
          let bodyPass = bodyData.password.trim();
          let hashPass = await bcrypt.hash(bodyPass, 10);
          dataObj["password"] = hashPass;
          dataObj["user_type"] = bodyData.user_type;
          dataObj["is_approved"] = false;
        }
        console.log("data", dataObj);
        let regUser = await new Model(Users).store(dataObj);
        if (_.isEmpty(regUser)) {
          return _this.res.send({
            status: 0,
            message: "error in saving data",
          });
=======
        const preferData = await new Model(UserPreferances).store(preferObj);

        // console.log("formObject/.files", formObject.files)
        const file = new File(formObject.files['user_profile']);
        // console.log("file", JSON.stringify(file))
        let fileObject = await file.store("users_image");
        var filepath = fileObject.filePartialPath;
        userProfile['user_profile'] = filepath
        userProfile["user_id"] = newUser._id;
        const userProfileObj = await new Model(UserProfiles).store(userProfile);
        // const imageStore = await new Model(UserImages).store(imageObj);

        if (_.isEmpty(preferData)) {
          return _this.res.send({ status: 0, message: lang.error_save_data });
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
        } else {
          let user_id = regUser._id;

          if (regUser.user_type === "student") {
            let addEducation = await new Model(EducationDetails).store({
              user_id: ObjectID(user_id),
            });
            let addTest = await new Model(TestScore).store({
              user_id: ObjectID(user_id),
            });
          } else if (regUser.user_type === "university") {
            let universityDetail = await new Model(UniversityDetails).store({
              user_id: ObjectID(user_id),
            });
          }

          return _this.res.send({
            status: 1,
            message: "Registration successfull",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "register",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
<<<<<<< HEAD
      return _this.res.send({ status: 0, message: "server error" });
=======
      return _this.res.send({ status: 0, message: lang.server_error });
    }
  }

  async uploadProfileImage() {
    var _this = this;
    try {

      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = formObject.fields;

      var userId = _this.req.user.userId;

      if (formObject.files) {
        var fileKeys = Object.keys(formObject.files)
        var ss = await this.imageUploadFn(fileKeys, formObject.files, userId);
        var imagArr = await UserImages.find({ "user_id": ObjectID(userId), is_profile_image: false }).sort({ "image_order": 1 })
        return _this.res.send({ status: 1, message: "Image uploaded successfully", data: imagArr });
      }



    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "deleteProfileImage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async imageUploadFn(fileKeys, files, user_id) {
    var _this = this;
    try {
      var arr = []
      return new Promise(async (resolve, reject) => {
        var imagArr = await UserImages.find({ "user_id": ObjectID(user_id), is_profile_image: false }).countDocuments();
        // imagArr = imagArr + 1;

        console.log("imagArr********", imagArr)
        _this.imageUploadRecuringFn(fileKeys, files, user_id, arr, imagArr, function (res) {
          resolve(res)
        })
      })

    } catch (error) {
      console.log("error", error)
    }
  }

  async imageUploadRecuringFn(fileKeys, files, user_id, arr, i, fn) {
    try {
      if (fileKeys.length > 0) {
        var key = fileKeys[0];
        if (key == 'user_profile') {
          fileKeys.splice(0, 1)
          i++
          this.imageUploadRecuringFn(fileKeys, files, user_id, arr, i, fn)
        } else {

          var imageObj = {}
          const file = new File(files[key]);
          // console.log("file", JSON.stringify(file))
          let fileObject = await file.store("users_image");
          var filepath = fileObject.filePartialPath;
          imageObj.image_name = filepath;

          if (key == 'user_profile') {
            imageObj.is_profile_image = true;
            imageObj.image_order = 0;
          } else {
            imageObj.image_order = i;
          }
          imageObj.user_id = ObjectID(user_id);
          const imageStore = await new Model(UserImages).store(imageObj);
          arr.push(imageStore)
          fileKeys.splice(0, 1)
          i++
          this.imageUploadRecuringFn(fileKeys, files, user_id, arr, i, fn)
        }
      } else {
        fn(arr)
      }
    } catch (error) {
      consoel.log("imageUploadRecuringFn", error)
    }
  }

  async FindMatches() {
    let _this = this;
    try {
      // console.log("body", _this.req.body);
      var bodyData = _this.req.body;
      var findUser = {}

      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }

      if (bodyData.location_type == 'current_location' && (bodyData.latitude == null) || (bodyData.latitude == undefined) || (bodyData.latitude == "")) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }

      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;

      let userId = ObjectID(this.req.user.userId);

      if (bodyData.location_type == 'current_location') {
        bodyData["location"] = { type: "Point", coordinates: [bodyData.longitude, bodyData.latitude] }
        findUser = bodyData;
        var UserProfilesData = await UserPreferances.findOneAndUpdate({ "user_id": userId }, { "location": bodyData["location"] });
        // console.log("UserProfilesData", UserProfilesData)
      } else {
        findUser = await UserPreferances.findOne({ user_id: userId });
      }

      console.log("FindMatches", bodyData)
      if (_.isEmpty(findUser)) {
        return _this.res.send({ status: 0, message: "user does not found" });
      }
      var milesToRadian = function (miles) {
        var earthRadiusInMiles = 3959;
        return miles / earthRadiusInMiles;
      };
      var filter = {
        "user_id": { $nin: [userId] },
        "preferred_age_from": { $gte: bodyData.preferred_age_from },
        "preferred_age_to": { $lte: bodyData.preferred_age_to },
        location: {
          $geoWithin: {
            $centerSphere: [findUser.location.coordinates, milesToRadian(bodyData.miles)],
          },
        }
      }
      // var query = {
      //   location: {
      //     $geoWithin: {
      //       $centerSphere: [findUser.location.coordinates, milesToRadian(bodyData.miles)],
      //     },
      //   },
      // };

      console.log("filter", JSON.stringify(filter))
      let list = await new Aggregation(UserPreferances).matchedUserDetails(
        filter,
        skip,
        _this.req.body.pagesize,
        userId
      );
      // console.log("list", list);
      return _this.res.send({ status: 1, total: list.length, data: list, page: bodyData.page , pagesize : bodyData.pagesize });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "FindMatches",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
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
      let user = await Users.findOne(
        { showkt_id: showkt_id },
        { user_phone: 1 }
      );
      console.log("user", user);
      if (user) {
        console.log("1111");
        return _this.res.send({
          status: 0,
          id_exists: true,
          message: lang.showkt_exist,
        });
      } else {
        console.log("22222");
        return _this.res.send({
          status: 1,
          id_exists: false,
          message: "Id is available for submit",
        });
      }
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "checkShowktidExist",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
    }
  }

  async updateUserProfile() {
    let _this = this;
    let filepath = "";
    try {
      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = formObject.fields;
      var dataObj = {};
      if (_this.req.body.is_student) {
        if (_this.req.body.name && _this.req.body.name[0].trim().length > 0) {
          dataObj["name"] = _this.req.body.name[0].trim();
        }
        if (_this.req.body.mobile && _this.req.body.mobile[0].length > 0) {
          dataObj["mobile"] = _this.req.body.mobile[0];
        }
        if (
          _this.req.body.father_name &&
          _this.req.body.father_name[0].trim().length > 0
        ) {
          dataObj["father_name"] = _this.req.body.father_name[0].trim();
        }

        if (
          _this.req.body.first_language &&
          _this.req.body.first_language[0].trim().length > 0
        ) {
          dataObj["first_language"] = _this.req.body.first_language[0].trim();
        }
        if (_this.req.body.dob && _this.req.body.dob[0].length > 0) {
          dataObj["dob"] = _this.req.body.dob[0];
        }
        if (_this.req.body.gender && _this.req.body.gender[0].length > 0) {
          dataObj["gender"] = _this.req.body.gender[0];
        }
        if (
          _this.req.body.citizenship_country &&
          _this.req.body.citizenship_country[0].length > 0
        ) {
          dataObj["citizenship_country"] =
            _this.req.body.citizenship_country[0];
        }
        if (
          _this.req.body.passport_number &&
          _this.req.body.passport_number[0].trim().length > 0
        ) {
          dataObj["passport_number"] = _this.req.body.passport_number[0].trim();
        }
        if (
          _this.req.body.marital_status &&
          _this.req.body.marital_status[0].length > 0
        ) {
          dataObj["marital_status"] = _this.req.body.marital_status[0];
        }
        if (
          _this.req.body.address &&
          _this.req.body.address[0].trim().length > 0
        ) {
          dataObj["address"] = _this.req.body.address[0].trim();
        }
        if (_this.req.body.country && _this.req.body.country[0].length > 0) {
          dataObj["country"] = _this.req.body.country[0];
        }
        if (_this.req.body.state && _this.req.body.state[0].length > 0) {
          dataObj["state"] = _this.req.body.state[0];
        }
        if (
          _this.req.body.pincode &&
          _this.req.body.pincode[0].trim().length > 0
        ) {
          dataObj["pincode"] = _this.req.body.pincode[0].trim();
        }
        if (
          _this.req.body.alternative_mobile &&
          _this.req.body.alternative_mobile[0].trim().length > 0
        ) {
          dataObj["alternative_mobile"] =
            _this.req.body.alternative_mobile[0].trim();
        }

        if (formObject.files.file) {
          const file = new File(formObject.files);
          let fileObject = await file.store("users_image", "user");
          filepath = fileObject.filePartialPath;
          dataObj.user_photo = filepath;
        }
        dataObj["profile_picture"] =
          dataObj.user_photo || "/public/no-image-user.png";
      }

      if (_this.req.body.is_university) {
        if (_this.req.body.name && _this.req.body.name[0].trim().length > 0) {
          dataObj["name"] = _this.req.body.name[0].trim();
        }
        if (
          _this.req.body.mobile &&
          _this.req.body.mobile[0].trim().length > 0
        ) {
          dataObj["mobile"] = _this.req.body.mobile[0].trim();
        }

        if (_this.req.body.country && _this.req.body.country[0].length > 0) {
          dataObj["country"] = _this.req.body.country[0];
        }
        if (_this.req.body.state && _this.req.body.state[0].length > 0) {
          dataObj["state"] = _this.req.body.state[0];
        }
        if (
          _this.req.body.official_website &&
          _this.req.body.official_website[0].length > 0
        ) {
          dataObj["official_website"] = _this.req.body.official_website[0];
        }

        if (formObject.files.file) {
          const file = new File(formObject.files);
          let fileObject = await file.store("users_image", "user");
          filepath = fileObject.filePartialPath;
          dataObj.user_photo = filepath;
        }
        dataObj["profile_picture"] =
          dataObj.user_photo || "/public/no-image-user.png";
      }
      let userId = ObjectID(_this.req.user.userId);

      const updatedUser = await Users.findByIdAndUpdate(userId, dataObj, {
        new: true,
      });
      if (_.isEmpty(updatedUser))
        return _this.res.send({
          status: 0,
          message: "profile update failed",
        });

      _this.res.send({
        status: 1,
        message: "profile has been updated successfully",
      });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "update user Api",
        function_name: "updateUserProfile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async UpdateUserDetails() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      let dataObj = {};
      if (bodyData.education_detail) {
        if (bodyData.highest_education) {
          dataObj["highest_education"] = bodyData.highest_education.trim();
        }
        if (bodyData.country_of_education) {
          dataObj["country_of_education"] = bodyData.country_of_education;
        }
        if (bodyData.grade_average) {
          dataObj["grade_average"] = bodyData.grade_average;
        }
        if (bodyData.school_start) {
          dataObj["school_start"] = bodyData.school_start;
        }
        if (bodyData.school_end) {
          dataObj["school_end"] = bodyData.school_end;
        }
        if (bodyData.school_country) {
          dataObj["school_country"] = bodyData.school_country;
        }
        if (bodyData.school_state) {
          dataObj["school_state"] = bodyData.school_state;
        }
        if (bodyData.school_address) {
          dataObj["school_address"] = bodyData.school_address.trim();
        }
        if (bodyData.school_zip) {
          dataObj["school_zip"] = bodyData.school_zip;
        }
        console.log("hit");

        let updateDetails = await EducationDetails.updateOne(
          {
            user_id: ObjectID(_this.req.user.userId),
          },
          dataObj
        );
        console.log(updateDetails);
        if (_.isEmpty(updateDetails)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Education details updated successfully",
          });
        }
      }
      if (bodyData.test_score) {
        if (bodyData.test_name) {
          dataObj["test_name"] = bodyData.test_name.trim();
        }
        if (bodyData.test_date) {
          dataObj["test_date"] = bodyData.test_date;
        }
        if (bodyData.reading_score) {
          dataObj["reading_score"] = bodyData.reading_score;
        }
        if (bodyData.lisning_score) {
          dataObj["lisning_score"] = bodyData.lisning_score;
        }
        if (bodyData.writing_score) {
          dataObj["writing_score"] = bodyData.writing_score;
        }
        if (bodyData.speaking_score) {
          dataObj["speaking_score"] = bodyData.speaking_score;
        }
        if (bodyData.overall) {
          dataObj["overall"] = bodyData.overall;
        }

        let updateTest = await TestScore.updateOne(
          {
            user_id: ObjectID(_this.req.user.userId),
          },
          dataObj,
          { new: true }
        );
        if (_.isEmpty(updateTest)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Test Scores updated successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "updateUserDetails",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async UpdateUniversityDetails() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      let dataObj = {};

      if (bodyData.university_type) {
        dataObj["university_type"] = bodyData.university_type;
      }
      if (bodyData.established_year) {
        dataObj["established_year"] = bodyData.established_year;
      }
      if (bodyData.world_rank) {
        dataObj["world_rank"] = bodyData.world_rank;
      }
      if (bodyData.rating) {
        dataObj["rating"] = bodyData.rating;
      }
      if (bodyData.accomodation) {
        dataObj["accomodation"] = bodyData.accomodation;
      }
      if (bodyData.scholarship) {
        dataObj["scholarship"] = bodyData.scholarship;
      }
      if (bodyData.part_time_work) {
        dataObj["part_time_work"] = bodyData.part_time_work;
      }
      if (bodyData.about) {
        dataObj["about"] = bodyData.about;
      }

      let updateDetails = await UniversityDetails.updateOne(
        {
          user_id: ObjectID(_this.req.user.userId),
        },
        dataObj
      );
      console.log(updateDetails);
      if (_.isEmpty(updateDetails)) {
        return _this.res.send({
          status: 0,
          message: "error in updating data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "University details updated successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "updateUniversityDetails",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetUserProfile() {
    let _this = this;
    try {
      if (!_this.req.body.user_id) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }

      let profile = await Users.findOne({
        _id: ObjectID(_this.req.body.user_id),
      }).lean();

      if (_.isEmpty(profile)) {
        return _this.req.send({ status: 0, message: "user does not found" });
      } else {
        let educationDetail = await EducationDetails.findOne({
          user_id: ObjectID(profile._id),
        });
        let testScore = await TestScore.findOne({
          user_id: ObjectID(profile._id),
        });

        profile["education_details"] = educationDetail;
        profile["test_score"] = testScore;

        return _this.res.send({
          status: 1,
          message: "user data retured successfully",
          data: profile,
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "getUserProfile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetUniversityProfile() {
    let _this = this;
    try {
      if (!_this.req.body.user_id) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }
      let filter = {
        _id: ObjectID(_this.req.body.user_id),
        user_type: "university",
        is_delete: false,
      };
      let profile = await new Aggregation(Users).getUniversityDetails(filter);
      console.log(profile);
      if (_.isEmpty(profile)) {
        return _this.res.send({ status: 0, message: "user does not found" });
      } else {
        return _this.res.send({
          status: 1,
          message: "user data retured successfully",
          data: profile,
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "getUserProfile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async userLogout() {
    let _this = this;
    var modelsNew = Users;
    var lang = langEn;
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
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "userLogout",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: lang.server_error });
    }
  }
<<<<<<< HEAD
=======

  async socialLogin() {
    let _this = this;
    let filter = "";
    var modelsNew = Users;
    var lang = langEn;
    try {
      var dataObj = _this.req.body;

      console.log("dataObj**", dataObj);

      if (!dataObj.email || !dataObj.login_type) {
        return fn({ status: 0, message: "Please send proper data" });
      }

      filter = { user_email: dataObj.email };
      // var fname = dataObj.firstname || "";
      // var lname = dataObj.lastname || "";
      var curaddr = dataObj.user_curent_location || null;
      const user = await modelsNew.findOne(filter);

      let globalObj = new Globals();
      const file = new File();

      var userimg = "users/user_" + Date.now().toString() + ".jpg";

      //console.log("user111", user)
      if (!_.isEmpty(user)) {
        console.log("1111111111");

        // var daatnew = {
        //     "_id": user._id,
        //     "photo": (dataObj.photo)?configs.aws_cdr_url+userimg : 'public/no-image-user.png',
        //     "firstName": user.user_firstname,
        //     "lastName": user.user_lastname,
        //     "login_type": user.login_type,
        //     "is_mobile": (user.user_phone && user.user_phone.length > 0) ? true : false
        // }
        const updateUser = await modelsNew.findByIdAndUpdate(
          user._id,
          {
            // user_photo: (dataObj.user_photo) ? userimg : 'public/no-image-user.png',
            user_curent_location: curaddr,
            //linkedin_url: dataObj.linkedin_url || "",
            // user_fullname: dataObj.user_fullname,
            // user_firstname: dataObj.firstname || "",
            // user_lastname: dataObj.lastname || "",
            device_id: dataObj.device_id || "",
            device_token: dataObj.device_token || "",
            device_type: dataObj.device_type || "",
            social_full_json: dataObj.social_full_json || "",
          },
          { new: true }
        );

        if (
          dataObj.user_curent_location_data &&
          dataObj.user_curent_location_data.length > 0
        ) {
          // _this.addUserLocation(user._id, dataObj.user_curent_location_data, dataObj.type_of);
        }
        await Authtokens.deleteMany({ userId: ObjectID(user._id) });

        var token = await globalObj.getToken(user._id);

        var daatnew = {
          user_fullname: user.user_fullname,
          showkt_id: user.showkt_id,
          user_bio: user.user_bio,
          user_dob: user.user_dob,
          user_gender: user.user_gender,
          user_id: user._id,
          user_phone: user.user_phone,
          user_email: user.user_email,
          account_type: user.account_type,
          photo: user.user_photo, //(dataObj.user_photo) ? userimg : 'public/no-image-user.png',
          // role: newUser.user_role,
          access_token: token,
        };

        if (dataObj.user_photo) {
          //console.log("*****11111", dataObj.user_photo, userimg)
          // const data = await file.downLoadImageFromServerToAws(dataObj.user_photo, userimg);
        }

        return _this.res.send({
          status: 1,
          message: "Login successfully.",
          data: daatnew,
          showkit_id: user.showkt_id ? user.showkt_id : false,
          is_profile: true,
        });
      } else if (_.isEmpty(user)) {
        console.log("22222222");
        let password = bcrypt.hashSync("Sagar@789!", 10);
        let data = {
          user_email: dataObj.email,
          login_type: dataObj.login_type || "",
          user_fullname: dataObj.user_fullname || "",
          user_password: password,
          user_photo: dataObj.user_photo ? userimg : "public/no-image-user.png",
          user_role: dataObj.role || "user",
          user_address: curaddr || "",
          device_id: dataObj.device_id || "",
          device_token: dataObj.device_token || "",
          device_type: dataObj.device_type || "",
          user_verificationStatus: true,
          user_status: "active",
          social_full_json: dataObj.social_full_json || "",
        };

        const newUser = await new Model(modelsNew).store(data);
        console.log("22222222****");
        if (_.isEmpty(newUser))
          return fn({ status: 0, message: "User not saved." });

        await Authtokens.deleteMany({ userId: ObjectID(newUser._id) });
        var token = await globalObj.getToken(newUser._id);

        var daatnew = {
          user_fullname: newUser.user_fullname,
          showkt_id: newUser.showkt_id,
          user_bio: newUser.user_bio,
          user_dob: newUser.user_dob,
          user_gender: newUser.user_gender,
          user_id: newUser._id,
          user_phone: newUser.user_phone,
          user_email: newUser.user_email,
          account_type: newUser.account_type,
          photo: dataObj.user_photo ? userimg : "public/no-image-user.png",
          // role: newUser.user_role,
          access_token: token,
        };

        console.log("22222222**********------");
        if (
          dataObj.user_curent_location_data &&
          dataObj.user_curent_location_data.length > 0
        ) {
          // _this.addUserLocation(newUser._id, dataObj.user_curent_location_data, dataObj.type_of);
        }

        if (dataObj.user_photo) {
          //console.log("*****2222", dataObj.user_photo, userimg)
          const data = await file.downLoadImageFromServerToAws(
            dataObj.user_photo,
            userimg
          );
        }

        return _this.res.send({
          status: 1,
          message: "Login successfully.",
          data: daatnew,
          showkit_id: newUser.showkt_id ? newUser.showkt_id : false,
          is_profile: false,
        });
      } else {
        return _this.res.send({ status: 0, message: "Server Error" });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "linkedInCommonCode",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async userListing() {
    let _this = this;
    let filter1 = "";

    if (!this.req.body.page || !_this.req.body.pagesize) {
      return this.res.send({ status: 0, message: "Please send proper data." });
    }

    try {
      if (_this.req.body.id) {
        filter1 = {
          delete_status: false,
          _id: ObjectID(_this.req.body.id),
          user_role: "user",
        };
      } else {
        filter1 = { delete_status: false, user_role: "user" };
      }

      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: 1 };
      if (_this.req.body.sort) {
        sort = _this.req.body.sort;
      }

      if (_this.req.body.is_from && _this.req.body.is_from === "search") {
        filter1["$or"] = [
          {
            user_firstname: {
              $regex: _this.req.body.search_text,
              $options: "i",
            },
          },
          {
            user_email: { $regex: _this.req.body.search_text, $options: "i" },
          },
          {
            user_lastname: {
              $regex: _this.req.body.search_text,
              $options: "i",
            },
          },
          {
            user_fullname: {
              $regex: _this.req.body.search_text,
              $options: "i",
            },
          },
        ];
      }

      console.log("filter1", skip, _this.req.body.pagesize, sort, filter1);
      const userListing = await new User(Users).userAdListing(
        skip,
        _this.req.body.pagesize,
        sort,
        filter1
      );

      const total = await new User(Users).userListingCount(sort, filter1);

      _this.res.send({
        status: 1,
        message: "User list",
        data: userListing,
        page: _this.req.body.page,
        perPage: _this.req.body.pagesize,
        paginatorTotal: total && total.length > 0 ? total[0].totalCount : 0,
      });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "userListing",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async addUserLocation(uid, curdata) {
    try {
      var ldata = {
        user_id: uid,
        user_curent_location: curdata,
        device_id: curdata.device_id || null,
        device_type: curdata.device_type || null,
        device_model: curdata.device_model || null,
        user_login_time: curdata.user_login_time || null,
      };

      const Locations = await new Model(Location).store(ldata);

      return new Promise((resolve, reject) => {
        if (_.isEmpty(Locations)) {
          //////console.log("Not saved")
          resolve({});
        } else {
          resolve(Locations);
        }
      });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "addUserLocation",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      //return _this.res.send({ status: 0, message: 'Server Error' });
    }
  }

  async getUserProfile() {
    let _this = this;
    let filter = {};
    var lang = langEn;
    var statusArr = [];
    var fnObj = {};
    var loginUserId = null;
    try {
      console.log("flag", this.req.body);

      var userId = this.req.body.user_id || this.req.user.userId;

      if (this.req.body.auth_user_id) {
        loginUserId = ObjectID(this.req.body.auth_user_id);
      }

      if (!userId) {
        return this.res.send({
          status: 0,
          message: "Please send proper data.",
        });
      }

      var userDetaiol = await Users.aggregate([
        {
          $match: { _id: ObjectID(userId) }
        },
        {
          $lookup: {
            from: "user_profiles",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"],
                  },
                },
              },
            ],
            as: "user_profiles",
          },
        },
        {
          $lookup: {
            from: "user_preferances",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"],
                  },
                },
              },
            ],
            as: "user_preferances",
          },
        },
        {
          $lookup: {
            from: "user_preferances",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"],
                  },
                },
              },
            ],
            as: "user_preferances",
          },
        },
        {
          $lookup: {
            from: "user_images",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", "$$userId"] },
                      { $eq: ["$is_profile_image", false] },
                    ],
                  },
                },
              },
              { "$sort": { "image_order": 1 } }
            ],
            as: "user_images",
          },
        },
        {
          $lookup: {
            from: "user_images",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", "$$userId"] },
                      { $eq: ["$is_profile_image", true] },
                    ],
                  },
                },
              },
            ],
            as: "user_Profile_images",
          },
        },
        // {
        //     $unwind: {
        //         path: "$users",
        //         preserveNullAndEmptyArrays: true // optional
        //     }
        // },
      ]);



      return _this.res.send({ status: 1, data: userDetaiol });

    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "getUserProfile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async downloadImage() {
    try {
      const file = new File();
      //'/public/download/image_sag.png' localpath
      const data = await file.downLoadImageFromServerToAws(
        "http://d36lr9hgdyglvn.cloudfront.net/images/1-mobile-app.png",
        "users/sagar_image1.jpg"
      );
      console.log(data); // The file is finished downloading.
      return this.res.send({ status: 1 });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getPopularUser() {
    let _this = this;
    let filter = { delete_status: false, user_role: "user" };
    var lang = langEn;
    var loginUserId = null;
    try {
      var page = _this.req.body.page || 1;
      var pagesize = _this.req.body.pagesize || 20;
      let skip = (page - 1) * pagesize;
      let sort = { followers_count: -1 };

      // var userList = await Users.find({ "delete_status": false, user_role: "user" }, {"user_fullname":1, "user_photo":1, "followers_count":1}).sort({"followers_count":-1}).skip(skip).limit(pagesize);

      // var total = await Users.countDocuments({ "delete_status": false, user_role: "user" })

      if (this.req.body.auth_user_id) {
        loginUserId = ObjectID(this.req.body.auth_user_id);
      }

      var userList = await new User(Users).getPopularUser(
        skip,
        pagesize,
        sort,
        filter,
        loginUserId
      );
      const total = await new User(Users).searchByUserCount(sort, filter);

      return _this.res.send({
        status: 1,
        data: userList,
        page: page,
        perPage: pagesize,
        total: total && total.length > 0 ? total[0]["totalCount"] : total,
      });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "getPopularUser",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async updateUserProfileStepOne() {
    var _this = this;
    try {

      var bodyData = _this.req.body;

      var UserProfilesData = await Users.findByIdAndUpdate({ "_id": ObjectID(_this.req.user.userId) }, bodyData);

      return _this.res.send({ status: 1, message: "Profile updated successfully" });


    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "updateUserProfileStepOne",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async deleteProfileImage() {
    var _this = this;
    try {

      var bodyData = _this.req.body;

      if (!bodyData.id)
        return _this.res.send({ status: 0, message: 'Please send proper data.' });

      console.log("bodyData", bodyData)
      // if(bodyData.is_delete){
      var filter = { "_id": ObjectID(bodyData.id), "user_id": ObjectID(_this.req.user.userId) }
      var deletem = await UserImages.deleteOne(filter)
      console.log("deletem", deletem, filter)
      // }


      return _this.res.send({ status: 1, message: "Image deleted successfully" });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "deleteProfileImage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async updateUserProfileStepTwo() {
    var _this = this;
    try {

      var bodyData = _this.req.body;

      // console.log("bodyData", bodyData)

      var UserProfilesData = await UserProfiles.findOneAndUpdate({ "user_id": ObjectID(_this.req.user.userId) }, bodyData);

      var newObj = {};

      if (bodyData.user_dob || bodyData.user_gender) {

        if (bodyData.user_dob) {
          let birthYear = parseInt(bodyData.user_dob.split("-")[0]);
          let currentYear = new Date().getFullYear();
          let userAge = currentYear - birthYear;
          console.log("userAge", userAge)
          newObj['user_age'] = userAge
        }

        if (bodyData.user_gender) {
          newObj['user_gender'] = bodyData.user_gender
        }


        await UserPreferances.findOneAndUpdate({ "user_id": ObjectID(_this.req.user.userId) }, newObj);
      }

      // console.log("UserProfilesData", UserProfilesData)

      return _this.res.send({ status: 1, message: "Profile updated successfully" });


    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "updateUserProfileStepTwo",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async updateUserProfileStepThree() {
    var _this = this;
    try {

      var bodyData = _this.req.body;

      var UserProfilesData = await UserPreferances.findOneAndUpdate({ "user_id": ObjectID(_this.req.user.userId) }, bodyData);

      return _this.res.send({ status: 1, message: "Profile updated successfully" });


    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "updateUserProfileStepTwo",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async setProfileImage() {
    var _this = this;
    try {

      console.log('_this.req.body', _this.req.body)

      // var img = await UserImages.updateMany({ "user_id": ObjectID(_this.req.user.userId) }, { "$set": { "is_profile_image": false } })

      // var imgup = await UserImages.findByIdAndUpdate({ "_id": ObjectID(_this.req.body.id) }, { "is_profile_image": true, "image_order": 0 });

      var UserProfilesData = await UserProfiles.findOneAndUpdate({ "user_id": ObjectID(_this.req.user.userId) }, { "user_profile": _this.req.body.image });

      return _this.res.send({ status: 1, message: "Profile image has been set successfully" });

    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "setProfileImage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async sortImage() {
    var _this = this;
    try {

      var bodyObj = _this.req.body;

      console.log("bodyObj", bodyObj)
      var userId = _this.req.user.userId;
      var oldId = bodyObj.old_id;
      var newId = bodyObj.new_id;

      if (!oldId || !newId)
        return _this.res.send({ status: 0, message: 'Please send proper data.' });

      var imgup = await UserImages.findByIdAndUpdate({ "_id": ObjectID(oldId) }, { "image_order": bodyObj.new_order });
      var imgup2 = await UserImages.findByIdAndUpdate({ "_id": ObjectID(newId) }, { "image_order": bodyObj.old_order });

      var imagArr = await UserImages.find({ "user_id": ObjectID(userId), is_profile_image: false }).sort({ "image_order": 1 })

      return _this.res.send({ status: 1, message: "Image updated successfully", data: imagArr });

    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "sortImage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async updateProfileImage() {
    var _this = this;
    try {
      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = formObject.fields;


      var imageObj = {}
      // console.log("formObject/.files", formObject.files)
      const file = new File(formObject.files['user_profile']);
      // console.log("file", JSON.stringify(file))
      let fileObject = await file.store("users_image");
      var filepath = fileObject.filePartialPath;

      var imgId = 0
      if (_this.req.body.id && _this.req.body.id[0]) {
        imgId = _this.req.body.id[0];
      }
      // console.log("imgId", _this.req.body, imgId)

      var UserProfilesData = await UserProfiles.findOneAndUpdate({ "user_id": ObjectID(_this.req.user.userId) }, { "user_profile": filepath });

      // var imgup = await UserImages.findByIdAndUpdate({ "_id": ObjectID(imgId) }, { "is_profile_image": true, "image_order": 0, "image_name": filepath });

      return _this.res.send({ status: 1, message: "Profile image updated successfully" });

    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "sortImage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async updateRestImage() {
    var _this = this;
    try {
      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = formObject.fields;
      var userId = _this.req.user.userId;

      var imageObj = {}
      // console.log("formObject/.files", formObject.files)
      const file = new File(formObject.files['user_profile']);
      // console.log("file", JSON.stringify(file))
      let fileObject = await file.store("users_image");
      var filepath = fileObject.filePartialPath;
      imageObj.image_name = filepath;
      imageObj.user_id = userId;


      var imgId = 0
      if (_this.req.body.image_order && _this.req.body.image_order[0]) {
        imageObj.image_order = _this.req.body.image_order[0];
      }

      imageObj.is_profile_image = false;

      console.log("imageObj", imageObj)

      const imageStore = await new Model(UserImages).store(imageObj);

      var imagArr = await UserImages.find({ "user_id": ObjectID(userId), is_profile_image: false }).sort({ "image_order": 1 })
      return _this.res.send({ status: 1, message: "Image uploaded successfully", data: imagArr });

    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "updateRestImage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
}

module.exports = UsersController;

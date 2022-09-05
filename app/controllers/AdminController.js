const Controller = require("./Controller");
const _ = require("lodash");
//const csvjson = require('csvjson');
const ObjectID = require("mongodb").ObjectId;
const Globals = require("../../configs/Globals");
const Admin = require("../models/AdminSchema").Admin;
const Users = require("../models/UserSchema").Users;
const Model = require("../models/Model");
const langEn = require("../../configs/en");
const bcrypt = require("bcrypt");
const Authtokens = require("../models/AuthenticationSchema").Authtokens;
let Form = require("../services/Form");
let File = require("../services/File");
const fs = require("fs");

class AdminController extends Controller {
  constructor() {
    super();
  }

  async AdminRegister() {
    let _this = this;
    let filter = "";
    try {
      var dataObj = {};
      if (
        _this.req.body.username &&
        _this.req.body.username.trim().length > 0
      ) {
        dataObj["username"] = _this.req.body.username.trim();
      }
      if (_this.req.body.fname && _this.req.body.fname.trim().length > 0) {
        dataObj["fname"] = _this.req.body.fname.trim();
      }
      if (_this.req.body.lname && _this.req.body.lname.trim().length > 0) {
        dataObj["lname"] = _this.req.body.lname.trim();
      }
      let password = bcrypt.hashSync(_this.req.body.password, 10);
      dataObj["password"] = password;

      const admin = await new Model(Admin).store(dataObj);
      if (_.isEmpty(admin)) {
        return _this.res.send({ status: 0, message: langEn.error_save_data });
      } else {
        return _this.res.send({ status: 1, message: "success" });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "AdminRegister",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: lang.server_error });
    }
  }
  async adminLogin() {
    let _this = this;

    if (!_this.req.body.email || !_this.req.body.password)
      return _this.res.send({ status: 0, message: "Please send proper data." });

    try {
      let filter = { email: _this.req.body.email };
      const admin = await Admin.findOne(filter);
      if (_.isEmpty(admin))
        return _this.res.send({ status: 0, message: "Admin not found." });
      const status = await bcrypt.compare(
        _this.req.body.password,
        admin.password
      );

      if (!status)
        return _this.res.send({
          status: 0,
          message: "Authentication Failed, Invalid Password.",
        });

      let globalObj = new Globals();
      const token = await globalObj.getToken(admin._id);

      let data = {
        _id: admin._id,
        email: admin.email,
      };

      _this.res.send({
        status: 1,
        message: "Logged in successfully.",
        access_token: token,
        data: data,
      });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "adminLogin",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async updateAdminProfile() {
    let _this = this;
    try {
      if (!_this.req.body.email) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let adminId = _this.req.user.userId;
      let update = await Admin.findByIdAndUpdate(
        { _id: ObjectID(adminId) },
        { email: _this.req.body.email },
        { new: true }
      );
      if (_.isEmpty(update)) {
        return _this.res.send({ status: 0, message: "error in updating data" });
      } else {
        return _this.res.send({
          status: 1,
          message: "details updated successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "UpdateAdminProfile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async changePasswordAdmin() {
    let _this = this;
    try {
      if (!_this.req.body.old_password || !_this.req.body.new_password) {
        return _this.res.send({
          status: 0,
          message: "please send old password and new password",
        });
      }
      let adminDetails = await Admin.findOne();
      let compareOldPass = await bcrypt.compare(
        _this.req.body.old_password,
        adminDetails.password
      );

      if (!compareOldPass) {
        return _this.res.send({
          status: 0,
          message: "entered old password is wrong",
        });
      } else {
        let hashPass = await bcrypt.hash(_this.req.body.new_password, 10);
        let updatePass = await Admin.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.user.userId),
          },
          { password: hashPass },
          { new: true }
        );
        if (_.isEmpty(updatePass)) {
          return _this.res.send({
            status: 0,
            message: "error in changing password",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "password changed successfully",
          });
        }
      }
    } catch (error) {
      console.log(error);
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "changePasswordAdmin",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async AdminProfile() {
    let _this = this;
    try {
      console.log("user id", _this.req.user.userId);
      const admin = await Admin.findOne({
        _id: ObjectID(_this.req.user.userId),
      });
      console.log(admin);
      if (_.isEmpty(admin))
        return _this.res.send({ status: 0, message: "Admin not found" });
      _this.res.send({ status: 1, message: "Admin found", data: admin });
    } catch (error) {
      console.log(error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "Adminprofile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async checkSession() {
    let _this = this;
    try {
      console.log("userId Admin", _this.req.user.userId);
      _this.res.send({ status: 1, message: "Session checked" });
      // var uid = atob(atob(atob(atob(atob(_this.req.body.uid)))));
      // const admin = await (new Model(Users)).findOne({ _id: uid }, { user_email: 1, user_firstname: 1, user_lastname: 1, user_photo: 1, user_phone: 1, user_company_name: 1 });
      // if (_.isEmpty(admin))
      //     return _this.res.send({ status: 0, message: 'User not found' });
      // _this.res.send({ status: 1, message: 'User found', data: admin[0] });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "profile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
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
      uid: _this.req.body.uid[0].length > 0 ? _this.req.body.uid[0] : null,
      user_firstname:
        _this.req.body.fname[0].length > 0 ? _this.req.body.fname[0] : null,
      user_lastname:
        _this.req.body.lname[0].length > 0 ? _this.req.body.lname[0] : null,
      user_phone:
        _this.req.body.phone[0].length > 0 ? _this.req.body.phone[0] : null,
      user_fullname: _this.getFullName(
        _this.req.body.fname[0],
        _this.req.body.lname[0]
      ),
    };

    if (formObject.files.file) {
      const file = new File(formObject.files);
      let fileObject = await file.store();
      let filepath = process.env.apiUrl + fileObject.filePartialPath;
      dataObj.user_photo = filepath;
    }

    if (!dataObj.uid || !dataObj.user_firstname || !dataObj.user_lastname)
      return this.res.send({ status: 0, message: "Please send proper data." });

    try {
      var uid = atob(atob(atob(atob(atob(dataObj.uid)))));
      const updatedUser = await Users.findByIdAndUpdate(uid, dataObj, {
        new: true,
      });
      _this.res.send({
        status: 1,
        message: "Admin updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "updateAdmin",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async editProfile() {
    let _this = this;
    try {
      let updateData = {};
      let bodyData = _this.req.body;
      console.log("bodydata", bodyData);
      if (!bodyData.admin_id) {
        return _this.res.send({ status: 0, message: "please send admin id" });
      }
      let adminId = ObjectID(bodyData.admin_id);
      if (bodyData.fname) {
        updateData["fname"] = bodyData.fname;
      }
      if (bodyData.fname) {
        updateData["lname"] = bodyData.lname;
      }

      const admin = await Admin.findByIdAndUpdate(
        { _id: adminId },
        updateData,
        { new: true }
      );

      if (_.isEmpty(admin))
        return _this.res.send({ status: 0, message: "Admin not updated." });

      _this.res.send({
        status: 1,
        message: "Admin updated successfully",
        data: admin,
      });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "editProfile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async changePassword() {
    let _this = this;

    try {
      ////console.log(this.req.body);
      if (!this.req.body.oldPassword || !this.req.body.newPassword)
        return _this.res.send({
          status: 0,
          message: "Please send proper data.",
        });
      let decoded = await Globals.decodeToken(_this.req.headers.authorization);
      let user = await new Model(Users).findOne({
        _id: decoded.id,
        role: "admin",
      });
      ////console.log("user", user);
      if (_.isEmpty(user))
        return _this.res.send({ status: 0, message: "User not found." });

      user = user[0];

      // if(!_.isEmpty(user) && user.isDeleted)
      //     return _this.res.send({status:0, message:'User is blocked by Admin.'});
      // if(!_.isEmpty(user) && (user.isIdVerified == 'rejected' || user.isIdVerified == 'pending'))
      //     return _this.res.send({status:0, message:'User have no rights.'});

      const status = await bcrypt.compare(
        _this.req.body.oldPassword,
        user.password
      );
      if (!status)
        return _this.res.send({
          status: 0,
          message: "Please enter correct old password.",
        });

      let password = bcrypt.hashSync(_this.req.body.newPassword, 10);
      const updatedUser = await Users.findByIdAndUpdate(
        decoded.id,
        { password: password },
        { new: true }
      );
      if (_.isEmpty(updatedUser))
        return _this.res.send({ status: 0, message: "password not updated." });

      _this.res.send({ status: 1, message: "Password change successfully." });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "changePassword",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async getUserData() {
    var _this = this;
    try {
      if (!_this.req.body.id) {
        return _this.res.send({ status: 0, message: "Please proper data" });
      }
      const serviceDataEn = await Users.findOne(
        { _id: ObjectID(_this.req.body.id) },
        {}
      );

      return _this.res.send({ status: 1, data: serviceDataEn });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "getUserData",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async fileUpload() {
    let _this = this;
    try {
      let form = new Form(this.req);
      let formObject = await form.parse();
      if (_.isEmpty(formObject.files))
        return _this.res.send({ status: 0, message: "Please send file." });
      const file = new File(formObject.files);
      let fileObject = await file.store();
      let filepath = process.env.apiUrl + fileObject.filePartialPath;
      let data = {
        filepath,
      };
      _this.res.send({ status: 1, message: "file ", data: data });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "fileUpload",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
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

      _.forEach(formObject.files.gallery_image, function (files, i) {
        var files = { file: [files] };
        const file = new File(files);
        let fileObject = file.bulkStore();
        let filepath = process.env.apiUrl + fileObject.filePartialPath;
        let data = {
          filepath,
        };

        if (i == imgArrLength - 1) {
          _this.res.send({ status: 1, message: "file ", data: data });
        }
      });
    } catch (error) {
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "bulkFileUpload",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
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
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "removeFile",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async addService() {
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
      var language =
        _this.req.body.language && _this.req.body.language[0]
          ? _this.req.body.language[0]
          : false;

      if (_this.req.body.title && _this.req.body.title[0].trim().length > 0) {
        dataObj["title"] = _this.req.body.title[0].trim().toLowerCase();
      }
      if (
        _this.req.body.discount &&
        _this.req.body.discount[0].trim().length > 0
      ) {
        dataObj["discount"] = _this.req.body.discount[0].trim();
      }
      if (
        _this.req.body.discount_status &&
        _this.req.body.discount_status[0].length > 0
      ) {
        dataObj["discount_status"] = _this.req.body.discount_status[0];
      }
      if (_this.req.body.hdiw && _this.req.body.hdiw[0].trim().length > 0) {
        dataObj["hdiw"] = _this.req.body.hdiw[0];
      }
      if (_this.req.body.result && _this.req.body.result[0].trim().length > 0) {
        dataObj["result"] = _this.req.body.result[0];
      }
      if (
        _this.req.body.result_average_time &&
        _this.req.body.result_average_time[0].trim().length > 0
      ) {
        dataObj["result_average_time"] = _this.req.body.result_average_time[0];
      }
      if (
        _this.req.body.service_category &&
        _this.req.body.service_category[0].trim().length > 0
      ) {
        dataObj["service_category"] = _this.req.body.service_category[0];
      }
      if (
        _this.req.body.treatmant &&
        _this.req.body.treatmant[0].trim().length > 0
      ) {
        dataObj["treatmant"] = _this.req.body.treatmant[0];
      }
      if (
        _this.req.body.treatment_time &&
        _this.req.body.treatment_time[0].trim().length > 0
      ) {
        dataObj["treatment_time"] = _this.req.body.treatment_time[0];
      }
      if (_this.req.body.wit && _this.req.body.wit[0].trim().length > 0) {
        dataObj["wit"] = _this.req.body.wit[0];
      }
      if (_this.req.body.price && _this.req.body.price[0].trim().length > 0) {
        dataObj["price"] = _this.req.body.price[0].trim();
      }
      if (
        _this.req.body.description &&
        _this.req.body.description[0].trim().length > 0
      ) {
        dataObj["description"] = _this.req.body.description[0].trim();
      }
      if (
        _this.req.body.short_description &&
        _this.req.body.short_description[0].trim().length > 0
      ) {
        dataObj["short_description"] =
          _this.req.body.short_description[0].trim();
      }
      if (_this.req.body.is_delete && _this.req.body.is_delete[0].length > 0) {
        dataObj["is_delete"] = _this.req.body.is_delete[0];
      }
      if (_this.req.body.tags && _this.req.body.tags[0].trim().length > 0) {
        dataObj["tags"] = _this.req.body.tags[0].trim();
      }

      if (
        _this.req.body.media_type &&
        _this.req.body.media_type[0].length > 0
      ) {
        dataObj["media_type"] = _this.req.body.media_type[0];
      }

      if (
        _this.req.body.country_price_arr &&
        _this.req.body.country_price_arr[0].length > 0
      ) {
        dataObj["country_price_arr"] = JSON.parse(
          _this.req.body.country_price_arr[0]
        );
      }

      var is_add =
        _this.req.body.is_add && _this.req.body.is_add[0] ? true : false;
      var is_update =
        _this.req.body.is_update && _this.req.body.is_update[0] ? true : false;

      ////console.log("language****", language, is_add, dataObj.title)
      if (is_add && !dataObj.title) {
        return _this.res.send({ status: 0, message: "Please proper data" });
      }
      ////console.log("1111111")
      ////console.log("language****", language, ObjectID())
      if (language == "er") {
        ModelVar = ErServices;
      } else if (language == "de") {
        ModelVar = DeServices;
      }

      if (
        dataObj["media_type"] == "Video" &&
        formObject.files &&
        formObject.files.envideo
      ) {
        const file = new File(formObject.files.envideo);
        console.log("file11", file);
        let fileObject = await file.store("video");
        let filepath = fileObject.filePartialPath;
        dataObj["video"] = filepath;

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

      if (
        dataObj["media_type"] == "Video" &&
        formObject.files &&
        formObject.files.ervideo
      ) {
        const file = new File(formObject.files.ervideo);
        console.log("file222", file);
        let fileObject = await file.store("video");
        let filepath = fileObject.filePartialPath;
        dataObj["video"] = filepath;
      }

      if (formObject.files && formObject.files.file) {
        const file = new File(formObject.files);
        let fileObject = await file.store("service_image");
        let filepath = fileObject.filePartialPath;
        dataObj.photo = filepath;
      }

      if (formObject.files && formObject.files.file) {
        const file = new File(formObject.files);
        let fileObject = await file.store("service_image");
        let filepath = fileObject.filePartialPath;
        dataObj.photo = filepath;
      }

      if (formObject.files && formObject.files.hdiw_images) {
        var hdiw_images_arr = await this.multiImageUpload(
          formObject.files.hdiw_images
        );
        ////console.log("hdiw_images_arr", hdiw_images_arr)
        hdiw_images = hdiw_images_arr;
      }

      if (formObject.files && formObject.files.result_images_before) {
        var result_images_before_arr = await this.multiImageUpload(
          formObject.files.result_images_before
        );
        ////console.log("result_images_before_arr", result_images_before_arr)
        result_images_before = result_images_before_arr;
      }

      if (formObject.files && formObject.files.result_images_after) {
        var result_images_after_arr = await this.multiImageUpload(
          formObject.files.result_images_after
        );
        ////console.log("result_images_after_arr", result_images_after_arr)
        result_images_after = result_images_after_arr;
      }

      if (is_update) {
        if (
          _this.req.body.hdiw_images_arr &&
          _this.req.body.hdiw_images_arr.length > 0
        ) {
          var hdiw_images = hdiw_images.concat(
            JSON.parse(_this.req.body.hdiw_images_arr[0])
          );
          ////console.log("_this.req.body.hdiw_images_arr", hdiw_images)
        }

        if (
          _this.req.body.result_images_before_arr &&
          _this.req.body.result_images_before_arr.length > 0
        ) {
          var result_images_before = result_images_before.concat(
            JSON.parse(_this.req.body.result_images_before_arr[0])
          );
        }
        if (
          _this.req.body.result_images_after_arr &&
          _this.req.body.result_images_after_arr.length > 0
        ) {
          var result_images_after = result_images_after.concat(
            JSON.parse(_this.req.body.result_images_after_arr[0])
          );
        }

        dataObj["hdiw_images"] = hdiw_images;
        dataObj["result_images_before"] = result_images_before;
        dataObj["result_images_after"] = result_images_after;

        ////console.log("dataObj", dataObj)
        //return false;
        var sid =
          _this.req.body.sid && _this.req.body.sid[0]
            ? ObjectID(_this.req.body.sid[0])
            : false;
        //console.log("sid", sid, dataObj)

        var srId = await ModelVar.findOne({ _id: ObjectID(sid) }, { _id: 1 });
        //console.log("srId", srId)
        //dataObj['updatedAt'] = Date.now();
        if (srId) {
          const updatedService = await ModelVar.findByIdAndUpdate(
            ObjectID(sid),
            dataObj,
            { new: true }
          );
          if (_.isEmpty(updatedService))
            return _this.res.send({
              status: 0,
              message: "Error in service update",
            });
          _this.res.send({
            status: 1,
            message: "Service updated successfully",
          });
        } else {
          dataObj["_id"] = ObjectID(sid);
          var EnServicesData = new ModelVar(dataObj);
          EnServicesData.save(function (err, serdata) {
            ////console.log(err, data)
            if (err) {
              _this.res.send({ status: 0, message: "Error in service update" });
            } else {
              if (language == "er") {
                _this.sendNotificationToUser(serdata);
              }
              _this.res.send({
                status: 1,
                message: "Service updated successfully",
                data: serdata._id,
              });
            }
          });
        }
      } else if (is_add) {
        if (language == "en") {
          dataObj["_id"] = ObjectID();
        } else {
          dataObj["_id"] = _this.req.body.id[0];
        }
        dataObj["hdiw_images"] = hdiw_images;
        dataObj["result_images_before"] = result_images_before;
        dataObj["result_images_after"] = result_images_after;
        ////console.log("dataObj['_id']",language, '-----', dataObj['_id'])
        var EnServicesData = new ModelVar(dataObj);
        EnServicesData.save(function (err, serdata) {
          ////console.log(err, data)
          if (err) {
            _this.res.send({ status: 0, message: "Error in service add" });
          } else {
            if (language == "er") {
              _this.sendNotificationToUser(serdata);
            }
            _this.res.send({
              status: 1,
              message: "Service added successfully",
              data: serdata._id,
            });
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
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "addService",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async sendNotificationToUser(serdata) {
    var filter = {};
    var _this = this;
    try {
      filter = { user_role: "user", delete_status: false };

      const userListCount = await Users.find(filter, {
        _id: 1,
      }).countDocuments();

      _this.userPaginate(userListCount, 0, 1, 20, serdata, function () {});
    } catch (error) {
      //console.log("error", error)
    }
  }

  async userPaginate(userListCount, length, page, pagesize, serdata, cb) {
    var _this = this;
    try {
      ////console.log(userListCount, length, page, pagesize)
      if (length <= userListCount) {
        var filter = { user_role: "user", delete_status: false };

        let skip = (page - 1) * pagesize;
        let sort = { createdAt: -1 };

        var userList = await Users.find(filter, {
          device_token: 1,
          user_email: 1,
          os_type: 1,
          localization: 1,
          user_fullname: 1,
        })
          .sort(sort)
          .skip(skip)
          .limit(pagesize);
        length = page * pagesize;

        ////console.log("length", length);

        this.saveNotification(userList, serdata, function (notRes) {
          ////console.log("res", notRes)

          page++;
          _this.userPaginate(
            userListCount,
            length,
            page,
            pagesize,
            serdata,
            cb
          );
        });
      } else {
        cb(true);
      }
      ////console.log("userList", userListCount)
    } catch (error) {
      //console.log("error", error)
    }
  }

  async saveNotification(userdata, serdata, cb) {
    var _this = this;
    try {
      if (userdata.length > 0) {
        //////console.log('data', data)
        var i = userdata[0];
        var body_msg =
          i.localization == "en"
            ? langEn.noti_new_service_text
            : langEr.noti_new_service_text;
        var title =
          i.localization == "en"
            ? langEn.noti_new_service_title
            : langEr.noti_new_service_title;

        var notofyData = {
          body_msg: body_msg,
          title: title,
          notify_type: "new_service_arrived",
          user_id: i._id,
          target_screen: "service_detail_screen",
          read_status: "unread",
          service_id: serdata._id,
          service_title: serdata.title,
          deletestatus: false,
          token: i.device_token,
          os_type: i.os_type,
        };

        var notiData = await Notifications.create(notofyData);
        // //console.log("notiData", notiData)
        notofyData["noti_id"] = notiData._id;

        // //console.log("notofyData", i._id)
        if (i.device_token) {
          var sss = await NotificationObj.send(
            notofyData,
            "new_service_arrive"
          );
          userdata.splice(0, 1);
          this.saveNotification(userdata, serdata, cb);
        } else {
          userdata.splice(0, 1);
          this.saveNotification(userdata, serdata, cb);
        }
      } else {
        cb(true);
      }
    } catch (error) {
      //console.log('error', error)
      userdata.splice(0, 1);
      this.saveNotification(userdata, serdata, cb);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Transaction Route Api",
        function_name: "saveNotification",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
    }
  }

  async multiImageUpload(hdiw_images) {
    try {
      return new Promise(async (resolve, reject) => {
        var hdiw_images_array = [];
        ////console.log("hdiw_images***********", hdiw_images)
        for (let i = 0; i < hdiw_images.length; i++) {
          const file = new File([hdiw_images[i]]);
          ////console.log("file****", file)
          let fileObject = await file.store("service_image");
          let filepath = fileObject.filePartialPath;
          hdiw_images_array.push(filepath);
          if (i === hdiw_images.length - 1) {
            return resolve(hdiw_images_array);
          }
        }
      });
    } catch (error) {
      //console.log("error",error)
    }
  }

  getHash(nonce, timestamp, key, base_string) {
    try {
      return new Promise((resolve, reject) => {
        var hmac = crypto.createHmac("sha1", key);
        hmac.update(base_string);
        var signature = hmac.digest("base64");
        var newArray = {
          signature: signature,
          nonce: nonce,
          timestamp: timestamp,
        };
        return resolve(newArray);
      });
    } catch (error) {}
  }

  async getUserLocationInfo() {
    var _this = this;
    var filter = {};
    try {
      if (!this.req.body.user_id) {
        return this.res.send({
          status: 0,
          message: "Please send proper data.",
        });
      }

      filter = { user_id: ObjectID(this.req.body.user_id) };
      var pagesize = this.req.body.pagesize;

      let skip = (this.req.body.page - 1) * pagesize;
      let sort = this.req.body.sort;

      var userList = await Location.find(filter, {})
        .sort(sort)
        .skip(skip)
        .limit(pagesize);
      var LocationCount = await Location.find(filter, {
        _id: 1,
      }).countDocuments();

      const locData = await new Model(Location).find(
        filter,
        {},
        {},
        this.req.body.sort
      );

      ////console.log(userListing);
      _this.res.send({
        status: 1,
        message: "Location data",
        data: locData,
        total: LocationCount,
      });
    } catch (error) {
      //console.log("error", error)
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "getUserLocationInfo",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async getAllDashboardData() {
    var _this = this;
    var filter = {};
    try {
    } catch (error) {
      //console.log("error", error)
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin Route Api",
        function_name: "getUserLocationInfo",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async UserList() {
    let _this = this;
    try {
      console.log(this.req.body);
      let filter = { is_delete: false };
      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return this.res.send({
          status: 0,
          message: "Please send proper data.",
        });
      }

      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: 1 };

      if (_this.req.body.is_student) {
        filter["user_type"] = "student";
        filter["is_approved"] = true;
      }
      if (_this.req.body.is_university) {
        filter["user_type"] = "university";
        filter["is_approved"] = true;
      }
      if (_this.req.body.for_approval) {
        filter["user_type"] = "university";
        filter["is_approved"] = false;
      }
      if (_this.req.body.filter_by === "country") {
        if (!_this.req.body.country_id)
          return _this.res.send({
            status: 0,
            message: "please send country id",
          });
        filter["user_type"] = "university";
        filter["is_approved"] = true;
        filter["country"] = ObjectID(_this.req.body.country_id);
      }
      console.log(filter);
      let userList = await Users.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(_this.req.body.pagesize);
      let count = await Users.countDocuments(filter);
      if (userList.length > 0) {
        _this.res.send({
          status: 1,
          message: " User list returned successfully",
          data: userList,
          count: count,
        });
      } else {
        _this.res.send({
          status: 1,
          message: " User list is empty",
          data: [],
          count: 0,
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "UserList",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async ChangeUserStatus() {
    let _this = this;

    try {
      if (!_this.req.body.user_id) {
        return _this.res.send({
          status: 0,
          message: "please send the user ID",
        });
      }

      if (_this.req.body.is_verify) {
        let verifyUser = await Users.findByIdAndUpdate(
          {
            _id: _this.req.body.user_id,
          },
          {
            is_approved: true,
          },
          { new: true }
        );

        if (_.isEmpty(verifyUser)) {
          return _this.res.send({
            status: 0,
            message: "error in  verify user",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "user verified  successfully",
          });
        }
      }
      if (_this.req.body.is_block == true) {
        let blockUser = await Users.findByIdAndUpdate(
          {
            _id: _this.req.body.user_id,
          },
          {
            is_block: true,
          },
          { new: true }
        );

        if (_.isEmpty(blockUser)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "user blocked successfully",
          });
        }
      } else if (_this.req.body.is_block == false) {
        let unblockUser = await Users.findByIdAndUpdate(
          {
            _id: _this.req.body.user_id,
          },
          { is_block: false },
          { new: true }
        );

        if (_.isEmpty(unblockUser)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "user unblocked successfully",
          });
        }
      } else {
        let deleteUser = await Users.findByIdAndUpdate(
          {
            _id: _this.req.body.user_id,
          },
          {
            is_delete: true,
          },
          { new: true }
        );

        if (_.isEmpty(deleteUser)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "user deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "Change user status",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async ChangeVarificationStatue() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      if (!bodyData.user_id) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }
      if (!bodyData.is_approved) {
        return _this.res.send({
          status: 0,
          message: "please send approval key",
        });
      }

      let status = await Users.findByIdAndUpdate(
        {
          _id: ObjectID(bodyData.user_id),
        },
        { is_approved: bodyData.is_approved },
        { new: true }
      );

      if (_.isEmpty(status)) {
        return _this.res.send({
          status: 0,
          message: "error in verification status update",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "status updated successfully",
        });
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
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
}

module.exports = AdminController;

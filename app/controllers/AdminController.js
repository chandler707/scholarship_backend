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
const GuestUser = require("../models/GuestUser").GuestUser;

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
        .limit(_this.req.body.pagesize)
        .populate("country")
        .populate("state");
      console.log(userList);
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

  async AddGuestUser() {
    let _this = this;
    try {
      let dataObj = {};
      let bodyData = _this.req.body;
      if (bodyData.email) {
        dataObj["email"] = bodyData.email;
      }
      if (bodyData.name) {
        dataObj["name"] = bodyData.name;
      }
      if (bodyData.mobile) {
        dataObj["mobile"] = bodyData.mobile;
      }
      if (bodyData.type) {
        dataObj["type"] = bodyData.type;
      }
      if (bodyData.amount) {
        dataObj["amount"] = bodyData.amount;
      }
      if (bodyData.from) {
        dataObj["from"] = bodyData.from;
      }

      let saveData = await new Model(GuestUser).store(dataObj);
      if (_.isEmpty(saveData)) {
        return _this.res.send({ status: 0, message: "error in saving data" });
      } else {
        return _this.res.send({
          status: 1,
          message: "data saved successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "Add guest user",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async GetGuestUser() {
    let _this = this;
    try {
      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return this.res.send({
          status: 0,
          message: "Please send proper data.",
        });
      }

      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: 1 };
      let filter = {};
      if (_this.req.body.is_popup) {
        filter = { is_delete: false, from: "popup" };
      } else if (_this.req.body.is_loan) {
        filter = { is_delete: false, from: "loan" };
      } else if (_this.req.body.is_money) {
        filter = { is_delete: false, from: "money" };
      } else if (_this.req.body.is_bank) {
        filter = { is_delete: false, from: "bank" };
      }
      console.log("fikler", filter);
      let getUser = await GuestUser.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(_this.req.body.pagesize);
      let count = await GuestUser.countDocuments(filter);
      if (getUser.length > 0) {
        return _this.res.send({
          status: 1,
          message: "all guest users returned successfully",
          data: getUser,
          count: count,
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "guest user list is empty",
          data: [],
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "Get guest user",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async deleteGuestUser() {
    let _this = this;
    try {
      let deleteUser = await GuestUser.findByIdAndUpdate(
        {
          _id: ObjectID(_this.req.body.guest_id),
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
          data: deleteUser,
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "guest user deleted successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "Delete guest user",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = AdminController;

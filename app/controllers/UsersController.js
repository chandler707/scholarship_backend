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
let Email = require("../services/Email");
var randomstring = require("randomstring");
const moment = require("moment");
const Aggregation = require("../models/Aggregation");
const bcrypt = require("bcrypt");
const { filterLimit } = require("async");
const EducationDetails =
  require("../models/EducationDetailSchema").EducationDetails;

const TestScore = require("../models/TestScoreSchema").TestScore;
const UniversityDetails =
  require("../models/UniversityDetail").UniversityDetails;

class UsersController extends Controller {
  constructor() {
    super();
  }

  async UserSignIn() {
    let _this = this;
    var filter = {};
    try {
      var loginData = _this.req.body;
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
        is_delete: false,
        is_block: false,
      };
      let user = await Users.findOne(filter).lean();

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

      if (!user.is_approved)
        return _this.res.send({
          status: 0,
          message: "Account Approval is pending",
        });

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
      let bodyData = _this.req.body;
      console.log("bodyData", bodyData);

      if (!bodyData.email) {
        return _this.res.send({ status: 0, message: "please send email" });
      }
      if (!bodyData.user_type) {
        return _this.res.send({ status: 0, message: "please send user type" });
      }
      let email = bodyData.email;
      let isExist = await Users.findOne({ email: email });
      console.log("exist", isExist);

      if (!_.isEmpty(isExist)) {
        return _this.res.send({
          status: 2,
          message: "you are already registered ..please login",
        });
      } else {
        let dataObj = {};
        if (bodyData.user_type === "student") {
          if (!bodyData.name || !bodyData.mobile || !bodyData.password) {
            return _this.res.send({
              status: 0,
              message: "please fill required fields",
            });
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

          dataObj["name"] = bodyData.name.trim();

          dataObj["mobile"] = bodyData.mobile;
          dataObj["country"] = bodyData.country;
          dataObj["state"] = bodyData.state;
          dataObj["official_website"] = bodyData.official_website.trim();

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
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async updateUserProfile() {
    let _this = this;
    let filepath = "";
    try {
      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = JSON.parse(formObject.fields.data[0]);
      console.log(formObject.files);

      var dataObj = {};
      if (_this.req.body.is_student) {
        if (_this.req.body.name) {
          dataObj["name"] = _this.req.body.name.trim();
        }
        if (_this.req.body.mobile) {
          dataObj["mobile"] = _this.req.body.mobile;
        }
        if (_this.req.body.father_name) {
          dataObj["father_name"] = _this.req.body.father_name.trim();
        }

        if (_this.req.body.first_language) {
          dataObj["first_language"] = _this.req.body.first_language;
        }
        if (_this.req.body.dob) {
          dataObj["dob"] = _this.req.body.dob;
        }
        if (_this.req.body.gender) {
          dataObj["gender"] = _this.req.body.gender;
        }
        if (_this.req.body.citizenship_country) {
          dataObj["citizenship_country"] = _this.req.body.citizenship_country;
        }
        if (_this.req.body.passport_number) {
          dataObj["passport_number"] = _this.req.body.passport_number.trim();
        }
        if (_this.req.body.marital_status) {
          dataObj["marital_status"] = _this.req.body.marital_status;
        }
        if (_this.req.body.address) {
          dataObj["address"] = _this.req.body.address.trim();
        }
        if (_this.req.body.country) {
          dataObj["country"] = _this.req.body.country;
        }
        if (_this.req.body.state) {
          dataObj["state"] = _this.req.body.state;
        }
        if (_this.req.body.pincode) {
          dataObj["pincode"] = _this.req.body.pincode;
        }
        if (_this.req.body.alternative_mobile) {
          dataObj["alternative_mobile"] = _this.req.body.alternative_mobile;
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
        if (_this.req.body.name) {
          dataObj["name"] = _this.req.body.name.trim();
        }
        if (_this.req.body.mobile) {
          dataObj["mobile"] = _this.req.body.mobile;
        }
        if (_this.req.body.country) {
          dataObj["country"] = _this.req.body.country;
        }
        if (_this.req.body.state) {
          dataObj["state"] = _this.req.body.state;
        }
        if (_this.req.body.address) {
          dataObj["address"] = _this.req.body.address;
        }
        if (_this.req.body.pincode) {
          dataObj["pincode"] = _this.req.body.pincode;
        }
        if (_this.req.body.official_website) {
          dataObj["official_website"] = _this.req.body.official_website;
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
      console.log(dataObj);

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
        console.log(bodyData);
        if (bodyData.education_data.highest_education) {
          dataObj["highest_education"] =
            bodyData.education_data.highest_education;
        }
        if (bodyData.education_data.country_of_education) {
          dataObj["country_of_education"] =
            bodyData.education_data.country_of_education;
        }
        if (bodyData.education_data.grade_average) {
          dataObj["grade_average"] = bodyData.education_data.grade_average;
        }
        if (bodyData.education_data.school_start) {
          dataObj["school_start"] = bodyData.education_data.school_start;
        }
        if (bodyData.education_data.school_end) {
          dataObj["school_end"] = bodyData.education_data.school_end;
        }
        if (bodyData.education_data.school_country) {
          dataObj["school_country"] = bodyData.education_data.school_country;
        }
        if (bodyData.education_data.school_state) {
          dataObj["school_state"] = bodyData.education_data.school_state;
        }
        if (bodyData.education_data.school_address) {
          dataObj["school_address"] =
            bodyData.education_data.school_address.trim();
        }
        if (bodyData.education_data.school_zip) {
          dataObj["school_zip"] = bodyData.education_data.school_zip;
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
        if (bodyData.test_data.test_name) {
          dataObj["test_name"] = bodyData.test_data.test_name;
        }
        if (bodyData.test_data.test_date) {
          dataObj["test_date"] = bodyData.test_data.test_date;
        }
        if (bodyData.test_data.reading_score) {
          dataObj["reading_score"] = bodyData.test_data.reading_score;
        }
        if (bodyData.test_data.lisning_score) {
          dataObj["lisning_score"] = bodyData.test_data.lisning_score;
        }
        if (bodyData.test_data.writing_score) {
          dataObj["writing_score"] = bodyData.test_data.writing_score;
        }
        if (bodyData.test_data.speaking_score) {
          dataObj["speaking_score"] = bodyData.test_data.speaking_score;
        }
        if (bodyData.test_data.overall) {
          dataObj["overall"] = bodyData.test_data.overall;
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
      console.log(bodyData);
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

      dataObj["accomodation"] = bodyData.accomodation;

      dataObj["scholarship"] = bodyData.scholarship;

      dataObj["part_time_work"] = bodyData.part_time_work;

      if (bodyData.about) {
        dataObj["about"] = bodyData.about;
      }
      console.log(dataObj);
      let updateDetails = await UniversityDetails.updateOne(
        {
          user_id: ObjectID(_this.req.user.userId),
        },
        dataObj
      );

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
      console.log("profile", _this.req.user.userId);
      if (!_this.req.user.userId) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }

      let profile = await Users.findOne({
        _id: ObjectID(_this.req.user.userId),
        is_delete: false,
        is_block: false,
      }).lean();
      console.log("ooo", profile);

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
      console.log("country");

      let filter = { is_delete: false, user_type: "university" };
      console.log("country", _this.req.body.country_id);

      if (_this.req.body.country_id) {
        console.log("country", _this.req.body.country_id);
        filter["country"] = _this.req.body.country_id;
      } else {
        if (!_this.req.body.user_id) {
          filter["_id"] = ObjectID(_this.req.user.userId);
        } else {
          filter["_id"] = ObjectID(_this.req.body.user_id);
        }
      }

      console.log(filter);
      let profile = await new Aggregation(Users).getUniversityDetails(filter);
      // console.log(profile);
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
    var lang = _this.req.body.localization === "en" ? langEn : langEr;
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

  async UserForgorPassword() {
    let _this = this;
    try {
      if (!_this.req.body.email) {
        return _this.res.send({ status: 0, message: "please send mail id" });
      }

      let checkUser = await Users.findOne({
        email: _this.req.body.email,
        is_delete: false,
        is_block: false,
      });

      if (_.isEmpty(checkUser)) {
        return _this.res.send({ status: 0, message: "accound not found" });
      } else {
        let emailObj = new Email();
        let getPass = await emailObj.sendForgetPasswordMail(checkUser.email);
        if (!getPass) {
          return _this.res.send({
            status: 0,
            message: "error in forgot password",
          });
        }
        let hashPass = await bcrypt.hash(getPass, 10);
        let updatePass = await Users.findByIdAndUpdate(
          { _id: checkUser._id },
          { password: hashPass },
          { new: true }
        );

        if (!updatePass) {
          return _this.res.send({
            status: 0,
            message: "error in updateing new passord",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "check email for new password",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "forgot password",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async UserChanegPassword() {
    let _this = this;
    try {
      if (!_this.req.body.old_password || !_this.req.body.new_password) {
        return _this.res.send({
          status: 0,
          message: "please send old password and new password",
        });
      }
      let userDetails = await Users.findOne({
        _id: ObjectID(_this.req.user.userId),
      });
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
        let updatePass = await Users.findByIdAndUpdate(
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
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "change password",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
}

module.exports = UsersController;

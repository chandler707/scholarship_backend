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
const Course = require("../models/CourseSchema").Course;
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
      // console.log("this is body", _this.req.body);

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
          console.log("inside file");
          const file = new File(formObject.files);
          let fileObject = await file.store("users_image", "user");
          filepath = fileObject.filePartialPath;
          dataObj.user_photo = filepath;
        }

        dataObj["profile_picture"] =
          dataObj.user_photo || _this.req.body.profile_picture;
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
          console.log("inside file university");

          const file = new File(formObject.files);
          let fileObject = await file.store("users_image", "user");
          filepath = fileObject.filePartialPath;
          dataObj.user_photo = filepath;
        }
        dataObj["profile_picture"] =
          dataObj.user_photo || _this.req.body.profile_picture;
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
      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = JSON.parse(formObject.fields.data[0]);
      let bodyData = _this.req.body;
      // console.log(bodyData, "asd");
      if (bodyData.education_detail) {
        console.log(bodyData.education_data);
        delete bodyData.education_data["_id"];

        // console.log(bodyData);

        console.log("hit");
        if (formObject.files.bachelor) {
          console.log("file h andar");
          const file = new File(formObject.files.bachelor);
          let fileObject = await file.store("users_documents", "bachelor");
          let filepath = fileObject.filePartialPath;
          bodyData.education_data.user_photo = filepath;
        }
        bodyData.education_data["bachelor_degree_marksheet"] =
          bodyData.education_data.user_photo ||
          bodyData.education_data.bachelor_degree_marksheet;

        if (formObject.files.tenth) {
          console.log("file h andar");
          const file = new File(formObject.files.tenth);
          let fileObject = await file.store("users_documents", "tenth");
          let filepath = fileObject.filePartialPath;
          bodyData.education_data.use_photo = filepath;
        }
        bodyData.education_data["tenth_marksheet"] =
          bodyData.education_data.use_photo ||
          bodyData.education_data.tenth_marksheet;

        if (formObject.files.twelfth) {
          console.log("file h andar");
          const file = new File(formObject.files.twelfth);
          let fileObject = await file.store("users_documents", "twelfth");
          let filepath = fileObject.filePartialPath;
          bodyData.education_data.us_photo = filepath;
        }
        bodyData.education_data["twelfth_marksheet"] =
          bodyData.education_data.us_photo ||
          bodyData.education_data.twelfth_marksheet;

        if (formObject.files.master) {
          console.log("file h andar");
          const file = new File(formObject.files.master);
          let fileObject = await file.store("users_documents", "master");
          let filepath = fileObject.filePartialPath;
          bodyData.education_data.u_photo = filepath;
        }
        bodyData.education_data["master_degree_marksheet"] =
          bodyData.education_data.u_photo ||
          bodyData.education_data.master_degree_marksheet;

        let updateDetails = await EducationDetails.updateOne(
          {
            user_id: ObjectID(_this.req.user.userId),
          },
          bodyData.education_data
        );

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
        delete bodyData.test_data["_id"];
        if (formObject.files.ilet) {
          console.log("file h andar");
          const file = new File(formObject.files.ilet);
          let fileObject = await file.store("users_documents", "ilet");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.a = filepath;
        }
        bodyData.test_data["ielts_marksheet"] =
          bodyData.test_data.a || bodyData.test_data.ielts_marksheet;

        if (formObject.files.gre) {
          console.log("file h andar");
          const file = new File(formObject.files.gre);
          let fileObject = await file.store("users_documents", "gre");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.b = filepath;
        }
        bodyData.test_data["gre_marksheet"] =
          bodyData.test_data.b || bodyData.test_data.gre_marksheet;

        if (formObject.files.gmat) {
          console.log("file h andar");
          const file = new File(formObject.files.gmat);
          let fileObject = await file.store("users_documents", "gmat");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.c = filepath;
        }
        bodyData.test_data["gmat_marksheet"] =
          bodyData.test_data.a || bodyData.test_data.gmat_marksheet;

        if (formObject.files.testas) {
          console.log("file h andar");
          const file = new File(formObject.files.testas);
          let fileObject = await file.store("users_documents", "testas");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.d = filepath;
        }
        bodyData.test_data["testas_marksheet"] =
          bodyData.test_data.d || bodyData.test_data.testas_marksheet;

        if (formObject.files.neet) {
          console.log("file h andar");
          const file = new File(formObject.files.neet);
          let fileObject = await file.store("users_documents", "neet");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.e = filepath;
        }
        bodyData.test_data["neet_marksheet"] =
          bodyData.test_data.e || bodyData.test_data.neet_marksheet;

        if (formObject.files.iit_mains) {
          console.log("file h andar");
          const file = new File(formObject.files.iit_mains);
          let fileObject = await file.store("users_documents", "iit_mains");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.f = filepath;
        }
        bodyData.test_data["iit_mains_marksheet"] =
          bodyData.test_data.f || bodyData.test_data.iit_mains_marksheet;

        if (formObject.files.iit_advance) {
          console.log("file h andar");
          const file = new File(formObject.files.iit_advance);
          let fileObject = await file.store("users_documents", "iit_advance");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.g = filepath;
        }
        bodyData.test_data["iit_advance_marksheet"] =
          bodyData.test_data.g || bodyData.test_data.iit_advance_marksheet;

        if (formObject.files.a1) {
          console.log("file h andar");
          const file = new File(formObject.files.a1);
          let fileObject = await file.store("users_documents", "a1");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.h = filepath;
        }
        bodyData.test_data["a1_certificate"] =
          bodyData.test_data.h || bodyData.test_data.a1_certificate;

        if (formObject.files.a2) {
          console.log("file h andar");
          const file = new File(formObject.files.a2);
          let fileObject = await file.store("users_documents", "a2");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.i = filepath;
        }
        bodyData.test_data["a2_certificate"] =
          bodyData.test_data.i || bodyData.test_data.a2_certificate;

        if (formObject.files.b1) {
          console.log("file h andar");
          const file = new File(formObject.files.b1);
          let fileObject = await file.store("users_documents", "b1");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.j = filepath;
        }
        bodyData.test_data["b1_certificate"] =
          bodyData.test_data.j || bodyData.test_data.b1_certificate;

        if (formObject.files.b2) {
          console.log("file h andar");
          const file = new File(formObject.files.b2);
          let fileObject = await file.store("users_documents", "b2");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.m = filepath;
        }
        bodyData.test_data["b2_certificate"] =
          bodyData.test_data.m || bodyData.test_data.b2_certificate;

        if (formObject.files.c1) {
          console.log("file h andar");
          const file = new File(formObject.files.c1);
          let fileObject = await file.store("users_documents", "c1");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.k = filepath;
        }
        bodyData.test_data["c1_certificate"] =
          bodyData.test_data.k || bodyData.test_data.c1_certificate;

        if (formObject.files.c2) {
          console.log("file h andar");
          const file = new File(formObject.files.c2);
          let fileObject = await file.store("users_documents", "c2");
          let filepath = fileObject.filePartialPath;
          bodyData.test_data.l = filepath;
        }
        bodyData.test_data["c2_certificate"] =
          bodyData.test_data.l || bodyData.test_data.c2_certificate;

        let updateTest = await TestScore.updateOne(
          {
            user_id: ObjectID(_this.req.user.userId),
          },
          bodyData.test_data,
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
      let userID = "";
      let profile;
      if (!_this.req.body.user_id) {
        userID = ObjectID(_this.req.user.userId);
        profile = await Users.findOne({
          _id: userID,
          is_delete: false,
          is_block: false,
        }).lean();
      } else {
        userID = ObjectID(_this.req.body.user_id);
        profile = await Users.findOne({
          _id: userID,
          is_delete: false,
          is_block: false,
        })

          .populate("country")
          .populate("state")
          .lean();
      }

      console.log("ooo", profile);

      if (_.isEmpty(profile)) {
        return _this.res.send({ status: 0, message: "user does not found" });
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
      if (_this.req.body.for_country) {
        let filter = { is_delete: false, user_type: "university" };
        let filterCount = { is_delete: false, user_type: "university" };

        if (_this.req.body.country_id) {
          console.log("country", _this.req.body.country_id);
          filter["country"] = _this.req.body.country_id;
          // filterCount["country"] = _this.req.body.country_id;
        } else if (_this.req.body.is_all) {
          filter["is_all"] = true;
        } else {
          if (!_this.req.body.user_id) {
            filter["_id"] = ObjectID(_this.req.user.userId);
            filterCount["_id"] = ObjectID(_this.req.user.userId);
          } else {
            filter["_id"] = ObjectID(_this.req.body.user_id);
            filterCount["_id"] = ObjectID(_this.req.body.user_id);
          }
        }
        let skip = 0;
        let sort = { createdAt: -1 };
        let pagesize = 100;

        if (_this.req.body.page && _this.req.body.pagesize) {
          console.log(
            "is it inside",
            _this.req.body.page,
            _this.req.body.pagesize
          );
          skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
          pagesize = _this.req.body.pagesize;
        }

        console.log(filter, "filter");
        let profile = await new Aggregation(Users).getUniversityDetails(
          filter,
          skip,
          sort,
          pagesize
        );
        let count = await Users.countDocuments(filterCount);
        // console.log(profile);
        if (_.isEmpty(profile)) {
          return _this.res.send({ status: 0, message: "user does not found" });
        } else {
          return _this.res.send({
            status: 1,
            message: "user data retured successfully",
            data: profile,
            count: count,
          });
        }
      } else {
        let filter = { category_id: ObjectID(_this.req.body.category_id) };
        console.log("filter", filter);
        let details = await new Aggregation(
          Course
        ).getUniversityDetailsByCourse(filter);
        console.log("details", details);
        if (_.isEmpty(details)) {
          return _this.res.send({ status: 0, message: "user does not found" });
        } else {
          return _this.res.send({
            status: 1,
            message: "user data retured successfully",
            data: details,
          });
        }
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

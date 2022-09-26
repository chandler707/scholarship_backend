const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Application = require("../models/ApplicationSchema").Application;

class ApplicationController extends Controller {
  constructor() {
    super();
  }

  async AddApplicaiton() {
    let _this = this;
    try {
      if (!_this.req.body.course_id && !_this.req.body.university_id) {
        return _this.res.send({
          status: 0,
          message: "please send course id",
        });
      }
      let bodyData = _this.req.body;
      bodyData["student_id"] = ObjectID(_this.req.user.userId);
      let checkExist = await Application.find({
        student_id: ObjectID(bodyData.student_id),
        course_id: ObjectID(_this.req.body.course_id),
      }).sort({ createdAt: -1 });
      console.log("dheeraj", checkExist);
      if (checkExist.length > 0 && checkExist[0].status != "reject") {
        if (checkExist[0].status === "pending") {
          return _this.res.send({
            status: 0,
            message: "your application is pending ...plase wait for response",
          });
        } else {
          return _this.res.send({
            status: 0,
            message:
              "you already applied for this course and your applicatin is approved",
          });
        }
      } else {
        let appData = await new Model(Application).store(bodyData);
        if (_.isEmpty(appData)) {
          return _this.res.send({
            status: 0,
            message: "error in saving data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "course applied successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "user route Api",
        function_name: "AddApplication",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetApplication() {
    let _this = this;
    try {
      if (_this.req.body.is_admin) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };

        let applicationList = await Application.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize)
          .populate("course_id")
          .populate("student_id")
          .populate("university_id");
        let count = await Application.countDocuments({ is_delete: false });
        if (applicationList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "Application list returned",
            data: applicationList,
            count: count,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      } else {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };

        let applicationList = await Application.find({
          is_delete: false,
          student_id: ObjectID(_this.req.user.userId),
        })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize)
          .populate("course_id")
          .populate("student_id")
          .populate("university_id");
        let count = await Application.countDocuments({
          is_delete: false,
          student_id: ObjectID(_this.req.user.userId),
        });

        if (applicationList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "Application list returned",
            data: applicationList,
            count: count,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "user route Api",
        function_name: "GetApplication",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateApplication() {
    let _this = this;
    try {
      if (!_this.req.body.application_id) {
        return _this.res.send({
          status: 0,
          message: "please send application id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let updateStatus = await Application.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.application_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateStatus)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Application updated successfully",
          });
        }
      } else {
        let delApp = await Application.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.application_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(delApp)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Application deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "user route Api",
        function_name: "ApplicationUpdate",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = ApplicationController;

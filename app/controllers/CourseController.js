const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Course = require("../models/CourseSchema").Course;
const Description = require("../models/DescriptionSchema").Description;

class CourseController extends Controller {
  constructor() {
    super();
  }
  async AddCourse() {
    let _this = this;
    try {
      console.log(_this.req.body);
      let bodyData = _this.req.body;
      let dataObj = {};

      if (!bodyData.category_id) {
        return _this.res.send({
          status: 0,
          message: "please send category id",
        });
      }
      dataObj["user_id"] = _this.req.user.userId;

      if (bodyData.category_id) {
        dataObj["category_id"] = bodyData.category_id;
      }
      if (bodyData.course_name) {
        dataObj["course_name"] = bodyData.course_name;
      }
      if (bodyData.type) {
        dataObj["type"] = bodyData.type;
      }
      if (bodyData.total_course_fees) {
        dataObj["total_course_fees"] = bodyData.total_course_fees;
      }
      if (bodyData.course_level) {
        dataObj["course_level"] = bodyData.course_level;
      }
      if (bodyData.course_duration) {
        dataObj["course_duration"] = bodyData.course_duration;
      }
      if (bodyData.course_program) {
        dataObj["course_program"] = bodyData.course_program;
      }
      if (bodyData.admission) {
        dataObj["admission"] = bodyData.admission;
      }
      if (bodyData.work_experience) {
        dataObj["work_experience"] = bodyData.work_experience;
      }
      if (bodyData.eligibility) {
        dataObj["eligibility"] = bodyData.eligibility;
      }
      if (bodyData.course_language) {
        dataObj["course_language"] = bodyData.course_language;
      }
      if (bodyData.required_degress) {
        dataObj["required_degress"] = bodyData.required_degress;
      }
      if (bodyData.fees) {
        dataObj["fees"] = bodyData.fees;
      }

      let addCourse = await new Model(Course).store(dataObj);

      console.log(addCourse);
      if (_.isEmpty(addCourse)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Course Added Successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        function_name: "AddCours",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetCourse() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let courseList = await Course.find({ is_delete: false });
        if (courseList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "Course list returned",
            data: courseList,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      } else {
        if (!_this.req.body.user_id) {
          return _this.res.send({
            status: 0,
            message: "Please send user id.",
          });
        }

        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let courseList = await Course.find({
          is_delete: false,
          user_id: ObjectID(_this.req.body.user_id),
        })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize)
          .populate("category_id")
          .populate("type")
          .populate("course_level")
          .populate("course_program")
          .populate("work_experience")
          .populate("course_language")
          .populate("required_degress");

        let count = await Course.countDocuments({
          is_delete: false,
          user_id: ObjectID(_this.req.body.user_id),
        });
        if (courseList != null) {
          if (courseList.length > 0) {
            return _this.res.send({
              status: 1,
              message: "course list returned",
              data: courseList,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: "course list is empty",
              data: [],
            });
          }
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "GetCourse",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async AddDescription() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      console.log(bodyData);
      if (!bodyData.country_id || !bodyData.category_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let findExist = await Description.findOne({
        country_id: ObjectID(bodyData.country_id),
        category_id: ObjectID(bodyData.category_id),
        is_delete: false,
      });
      console.log("ds", findExist);
      if (!_.isEmpty(findExist)) {
        return _this.res.send({
          status: 0,
          message: "you are not allowed to add another description",
        });
      } else {
        let addDes = await new Model(Description).store(bodyData);
        if (_.isEmpty(addDes)) {
          return _this.res.send({ status: 0, message: "error in saving data" });
        } else {
          return _this.res.send({
            status: 1,
            message: "Description added successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "Add Description",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetDescription() {
    let _this = this;
    try {
      if (!_this.req.body.description_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let desList = await Description.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize)
          .populate("country_id")
          .populate("category_id");
        let count = await Description.countDocuments({ is_delete: false });
        if (desList != null) {
          if (desList.length > 0) {
            return _this.res.send({
              status: 1,
              message: "description list returned",
              data: desList,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: "description list is empty",
              data: [],
            });
          }
        }
      } else {
        let singleDes = await Description.findOne({
          _id: ObjectID(_this.req.body.description_id),
          is_delete: false,
        });

        if (!_.isEmpty(singleDes)) {
          return _this.res.send({
            status: 1,
            message: "Description  returned",
            data: singleDes,
          });
        } else {
          return _this.res.send({
            status: 0,
            message: "something wrong",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "GetDescription",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateDescription() {
    let _this = this;
    try {
      if (!_this.req.body.description_id) {
        return _this.res.send({
          status: 0,
          message: "please send description id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let updateDes = await Description.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.description_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateDes)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Description updated successfully",
          });
        }
      } else {
        let delDes = await Description.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.description_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(delDes)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Description deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "UpdateDescription",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = CourseController;

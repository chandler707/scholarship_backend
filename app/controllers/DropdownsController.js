const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const CourseLevel = require("../models/DropdownsSchema").CourseLevel;
const CourseType = require("../models/DropdownsSchema").CourseType;
const CourseDuration = require("../models/DropdownsSchema").CourseDuration;
const CourseExperience = require("../models/DropdownsSchema").CourseExperience;
const EntranceExam = require("../models/DropdownsSchema").EntranceExam;
const Grading = require("../models/DropdownsSchema").Grading;
const GradingAverage = require("../models/DropdownsSchema").GradingAverage;
const RequiredDegree = require("../models/DropdownsSchema").RequiredDegree;
const CourseProgram = require("../models/DropdownsSchema").CourseProgram;

class DropdownsController extends Controller {
  constructor() {
    super();
  }

  async AddCourseLevel() {
    let _this = this;
    try {
      if (!_this.req.body.course_level) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(CourseLevel).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCourseLevel() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await CourseLevel.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.course_level_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await CourseLevel.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await CourseLevel.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await CourseLevel.findOne({
          _id: ObjectID(_this.req.body.course_level_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCourseLevel() {
    let _this = this;
    try {
      if (!_this.req.body.course_level_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await CourseLevel.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_level_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await CourseLevel.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.course_level_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddCourseType() {
    let _this = this;
    try {
      if (!_this.req.body.course_type) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(CourseType).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCourseType() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await CourseType.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.course_type_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await CourseType.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await CourseType.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await CourseType.findOne({
          _id: ObjectID(_this.req.body.course_type_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCourseType() {
    console.log("inside this");

    let _this = this;
    try {
      console.log("inside this");
      if (!_this.req.body.course_type_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data got it",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await CourseType.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_type_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await CourseType.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.course_type_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddCourseProgram() {
    let _this = this;
    try {
      if (!_this.req.body.course_program) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(CourseProgram).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCourseProgram() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await CourseProgram.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.course_program_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await CourseProgram.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await CourseProgram.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await CourseProgram.findOne({
          _id: ObjectID(_this.req.body.course_program_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCourseProgram() {
    let _this = this;
    try {
      if (!_this.req.body.course_program_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await CourseProgram.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_program_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await CourseProgram.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.course_program_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async AddCourseExperience() {
    let _this = this;
    try {
      if (!_this.req.body.course_experience) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(CourseExperience).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCourseExperience() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await CourseExperience.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.course_experience_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await CourseExperience.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await CourseExperience.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await CourseExperience.findOne({
          _id: ObjectID(_this.req.body.course_experience_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCourseExperience() {
    let _this = this;
    try {
      if (!_this.req.body.course_experience_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await CourseExperience.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_experience_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await CourseExperience.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_experience_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddGrading() {
    let _this = this;
    try {
      if (!_this.req.body.grading) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(Grading).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetGrading() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await Grading.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.grading_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await Grading.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await Grading.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await Grading.findOne({
          _id: ObjectID(_this.req.body.grading_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateGrading() {
    let _this = this;
    try {
      if (!_this.req.body.grading_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await Grading.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.grading_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await Grading.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.grading_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddRequiredDegree() {
    let _this = this;
    try {
      if (!_this.req.body.required_degree) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(RequiredDegree).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetRequiredDegree() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await RequiredDegree.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.required_degree_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await RequiredDegree.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await RequiredDegree.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await RequiredDegree.findOne({
          _id: ObjectID(_this.req.body.required_degree_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateRequiredDegree() {
    let _this = this;
    try {
      if (!_this.req.body.required_degree_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await RequiredDegree.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.required_degree_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await RequiredDegree.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.required_degree_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddEnranceExam() {
    let _this = this;
    try {
      if (!_this.req.body.entrance_exam) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(EntranceExam).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetEntranceExam() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await EntranceExam.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.entrance_exam_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await EntranceExam.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await EntranceExam.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await EntranceExam.findOne({
          _id: ObjectID(_this.req.body.entrance_exam_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateEntranceExam() {
    let _this = this;
    try {
      if (!_this.req.body.entrance_exam_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await EntranceExam.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.entrance_exam_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await EntranceExam.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.entrance_exam_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddCourseDuration() {
    let _this = this;
    try {
      if (!_this.req.body.course_duration) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(CourseDuration).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCourseDuration() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let list = await CourseDuration.find({ is_delete: false });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.course_duration_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await CourseDuration.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await CourseDuration.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await CourseDuration.findOne({
          _id: ObjectID(_this.req.body.course_duration_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCourseDuration() {
    let _this = this;
    try {
      if (!_this.req.body.course_duration_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await CourseDuration.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_duration_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await CourseDuration.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.course_duration_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
  async AddGradeAverage() {
    let _this = this;
    try {
      if (!_this.req.body.grade_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(GradingAverage).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: " added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropDown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetGradingAverage() {
    let _this = this;
    try {
      if (_this.req.body.grading_id) {
        let list = await GradingAverage.find({
          is_delete: false,
          grading_id: ObjectID(_this.req.body.grading_id),
        });
        if (list.length > 0) {
          return _this.res.send({
            status: 1,
            message: " list returned",
            data: list,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.grading_average_id && !_this.req.body.grading_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let list = await GradingAverage.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await GradingAverage.countDocuments({ is_delete: false });
        if (list != null) {
          if (list.length > 0) {
            return _this.res.send({
              status: 1,
              message: " list returned",
              data: list,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: " list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await GradingAverage.findOne({
          _id: ObjectID(_this.req.body.grading_average_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "data returned",
            data: single,
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
        function_name: "dwopdown's functions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateGradingAverage() {
    let _this = this;
    try {
      if (!_this.req.body.grading_average_id) {
        return _this.res.send({
          status: 0,
          message: "please send proper data",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await GradingAverage.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.grading_average_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(update)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " updated successfully",
          });
        }
      } else {
        let del = await GradingAverage.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.grading_average_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: " deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "dropdown's funtions",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = DropdownsController;

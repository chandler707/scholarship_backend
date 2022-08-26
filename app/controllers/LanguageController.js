const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Language = require("../models/LanguageSchema").Language;
const CourseCategory = require("../models/CoursesCategory").CourseCategory;

class LanguageController extends Controller {
  constructor() {
    super();
  }

  async AddLanguage() {
    let _this = this;
    try {
      if (!_this.req.body.language_name) {
        return _this.res.send({
          status: 0,
          message: "please send language",
        });
      }
      let bodyData = _this.req.body;
      let languageData = await new Model(Language).store(bodyData);
      if (_.isEmpty(languageData)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "language added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "addLanguage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetLanguage() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let languageList = await Language.find({ is_delete: false });
        if (languageList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "language list returned",
            data: languageList,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.language_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let languageList = await Language.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await Language.countDocuments({ is_delete: false });
        if (languageList != null) {
          if (languageList.length > 0) {
            return _this.res.send({
              status: 1,
              message: "language list returned",
              data: languageList,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: "language list is empty",
              data: [],
            });
          }
        }
      } else {
        let singlelanguage = await Language.findOne({
          _id: ObjectID(_this.req.body.language_id),
          is_delete: false,
        });

        if (!_.isEmpty(singlelanguage)) {
          return _this.res.send({
            status: 1,
            message: "language  returned",
            data: singlelanguage,
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
        function_name: "GetLanguage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateLanguage() {
    let _this = this;
    try {
      if (!_this.req.body.language_id) {
        return _this.res.send({
          status: 0,
          message: "please send language id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let updateLanguage = await Language.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.language_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateLanguage)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "language updated successfully",
          });
        }
      } else {
        let delLanguage = await Language.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.language_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(delLanguage)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "language deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "Updatelanguage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async AddCoursesCategory() {
    let _this = this;
    try {
      if (!_this.req.body.category_name) {
        return _this.res.send({
          status: 0,
          message: "please send course",
        });
      }
      let bodyData = _this.req.body;
      let data = await new Model(CourseCategory).store(bodyData);
      if (_.isEmpty(data)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Courses added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "addCourses",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCoursesCategory() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let categoryList = await CourseCategory.find({ is_delete: false });
        if (categoryList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "category list returned",
            data: categoryList,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.category_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let catList = await CourseCategory.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await CourseCategory.countDocuments({ is_delete: false });
        if (catList != null) {
          if (catList.length > 0) {
            return _this.res.send({
              status: 1,
              message: "course list returned",
              data: catList,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: "Courses list is empty",
              data: [],
            });
          }
        }
      } else {
        let singleCourse = await CourseCategory.findOne({
          _id: ObjectID(_this.req.body.category_id),
          is_delete: false,
        });

        if (!_.isEmpty(singleCourse)) {
          return _this.res.send({
            status: 1,
            message: "course  returned",
            data: singleCourse,
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
        function_name: "GetCategory",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCoursesCategory() {
    let _this = this;
    try {
      if (!_this.req.body.category_id) {
        return _this.res.send({
          status: 0,
          message: "please send category id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let updateCat = await CourseCategory.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.category_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateCat)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Category updated successfully",
          });
        }
      } else {
        let delCategory = await CourseCategory.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.category_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(delCategory)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Category deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "UpdateCategory",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = LanguageController;

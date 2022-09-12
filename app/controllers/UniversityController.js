const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Users = require("../models/UserSchema").Users;

class UniversityController extends Controller {
  constructor() {
    super();
  }

  async GetUniversityList() {
    let _this = this;
    try {
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
}

module.exports = UniversityController;

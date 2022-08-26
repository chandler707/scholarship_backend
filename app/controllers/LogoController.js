const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const Globals = require("../../configs/Globals");
const Model = require("../models/Model");
let Form = require("../services/Form");
let File = require("../services/File");

const Logo = require("../models/LogoSchema").Logo;
const _ = require("lodash");

class LogoController extends Controller {
  constructor() {
    super();
  }

  async GetLogo() {
    let _this = this;
    try {
      let getLogo = await Logo.findOne();

      if (!_.isEmpty(getLogo)) {
        return _this.res.send({
          status: 1,
          message: "Logo returned successfully",
          data: getLogo,
        });
      } else {
        return _this.res.send({
          status: 0,
          message: "something went wrong",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "GetLogo",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async UpdateLogo() {
    let _this = this;
    try {
      let form = new Form(_this.req);
      let formObject = await form.parse();
      _this.req.body = formObject.fields;
      var dataObj = {};

      if (!_this.req.body.logo_id[0]) {
        return _this.res.send({ status: 0, message: "send logo id " });
      }

      if (formObject.files.logo_url) {
        console.log("inside file");
        const file = new File(formObject.files.logo_url);
        let fileObject = await file.store("logo");
        var filepath = fileObject.filePartialPath;
        dataObj["logo_url"] = filepath;
      }
      console.log("thisd is ", formObject.files);
      let updateLogo = await Logo.findByIdAndUpdate(
        {
          _id: ObjectID(_this.req.body.logo_id[0]),
        },
        dataObj,
        { new: true }
      );
      if (_.isEmpty(updateLogo)) {
        return _this.res.send({ status: 0, message: "error in update data" });
      } else {
        return _this.res.send({
          status: 1,
          message: "Logo updated successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "UpdateLogo",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
}

module.exports = LogoController;

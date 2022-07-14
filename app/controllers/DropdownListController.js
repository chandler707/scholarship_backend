const Controller = require("./Controller");
const ObjectId = require("mongodb").ObjectID;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Countries = require("../models/DropdownListSchema").Countries;
const States = require("../models/DropdownListSchema").States;
const Cities = require("../models/DropdownListSchema").Cities;
const Languages = require("../models/DropdownListSchema").Languages;

class DropdownListController extends Controller {
  constructor() {
    super();
  }

  async GetCountry() {
    let _this = this;
    try {
      let countryList = await Countries.find({});
      if (countryList != null) {
        if (countryList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "countries list returned",
            data: countryList,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "countries list is empty",
            data: [],
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Get Country Api",
        function_name: "GetCountry",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetState() {
    let _this = this;
    try {
      if (!_this.req.body.country_id) {
        return _this.res.send({
          status: 0,
          message: "send country id",
        });
      }
      let stateList = await States.find({
        country_id: _this.req.body.country_id,
      });
      if (stateList != null) {
        if (stateList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "states list returned",
            data: stateList,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "states list is empty",
            data: [],
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Get state Api",
        function_name: "GetStates",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCity() {
    let _this = this;
    try {
      if (!_this.req.body.state_id) {
        return _this.res.send({
          status: 0,
          message: "send state id",
        });
      }
      let cityList = await Cities.find({ state_id: _this.req.body.state_id });
      if (cityList != null) {
        if (cityList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "city list returned",
            data: cityList,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "city list is empty",
            data: [],
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Get city Api",
        function_name: "GetCity",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async Getlanguage() {
    let _this = this;
    try {
      let languageList = await Languages.find({ status: true });
      if (languageList != null) {
        if (languageList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "Language list returned",
            data: languageList,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Language list is empty",
            data: [],
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Get language Api",
        function_name: "Getlanguage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = DropdownListController;

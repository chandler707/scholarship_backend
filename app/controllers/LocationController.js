const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const State = require("../models/LocationSchema").State;
const Country = require("../models/LocationSchema").Country;

class LocationController extends Controller {
  constructor() {
    super();
  }

  async AddCountry() {
    let _this = this;
    try {
      if (!_this.req.body.country_name) {
        return _this.res.send({
          status: 0,
          message: "please send country name",
        });
      }
      let bodyData = _this.req.body;
      let countryData = await new Model(Country).store(bodyData);
      if (_.isEmpty(countryData)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "country added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "addcountry",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetCountry() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let countryList = await Country.find({ is_delete: false });
        if (countryList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "country list returned",
            data: countryList,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.country_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let countryList = await Country.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await Country.countDocuments({ is_delete: false });
        if (countryList != null) {
          if (countryList.length > 0) {
            return _this.res.send({
              status: 1,
              message: "country list returned",
              data: countryList,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: "countryList list is empty",
              data: [],
            });
          }
        }
      } else {
        let singleCountry = await Country.findOne({
          _id: ObjectID(_this.req.body.country_id),
          is_delete: false,
        });

        if (!_.isEmpty(singleCountry)) {
          return _this.res.send({
            status: 1,
            message: "country  returned",
            data: singleCountry,
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
        function_name: "Getcountry",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateCountry() {
    let _this = this;
    try {
      if (!_this.req.body.country_id) {
        return _this.res.send({
          status: 0,
          message: "please send country id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let updateCountry = await Country.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.country_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateCountry)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "country updated successfully",
          });
        }
      } else {
        let delCountry = await Country.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.country_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(delCountry)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          console.log("del country", delCountry);
          let deleteStateByCity = await State.updateMany(
            {
              country_id: delCountry._id,
            },
            {
              is_delete: true,
            }
          );
          return _this.res.send({
            status: 1,
            message: "country deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "Updatecountry",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async AddState() {
    let _this = this;
    try {
      if (!_this.req.body.country_id) {
        return _this.res.send({ status: 0, message: "please send country id" });
      }
      let bodyData = _this.req.body;
      let stateData = await new Model(State).store(bodyData);
      if (_.isEmpty(stateData)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "state added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "addState",
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
      if (_this.req.body.is_all) {
        let stateList = await State.find({ is_delete: false });
        if (stateList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "state list returned",
            data: stateList,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "state list empty",
            data: [],
          });
        }
      } else if (!_this.req.body.country_id && !_this.req.body.state_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let stateList = await State.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize)
          .populate("country_id");

        let count = await State.countDocuments({ is_delete: false });

        if (stateList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "state list returned",
            data: stateList,
            count: count,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "state list is empty",
            data: [],
          });
        }
      } else if (_this.req.body.country_id) {
        let findByCountry = await Country.find({
          country_id: ObjectID(_this.req.body.country_id),
          is_delete: false,
        });

        if (findByCountry.length > 0) {
          return _this.res.send({
            status: 1,
            message: "state returned by country",
            data: findByCountry,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "state list is empty",
            data: [],
          });
        }
      } else if (_this.req.body.state_id) {
        let singleState = await State.findOne({
          _id: ObjectID(_this.req.body.state_id),
          is_delete: false,
        });

        if (!_.isEmpty(singleState)) {
          return _this.res.send({
            status: 1,
            message: "single state returned  ",
            data: singleState,
          });
        } else {
          return _this.res.send({
            status: 0,
            message: "something went wrong",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "GetState",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateState() {
    let _this = this;
    try {
      if (!_this.req.body.state_id) {
        return _this.res.send({
          status: 0,
          message: "please send state id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let updateState = await State.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.state_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateState)) {
          return _this.res.send({
            status: 0,
            message: "error in updating data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "state updated successfully",
          });
        }
      } else {
        let delState = await State.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.state_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(delState)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "state deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "UpdateState",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

module.exports = LocationController;

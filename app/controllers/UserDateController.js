const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Users = require("../models/UserSchema").Users;
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Aggregation = require("../models/Aggregation");
const moment = require("moment");
const UserDates = require("../models/userDateSchema").UserDates;
const DateDetails = require("../models/dateDetailSchema").DateDetails;
class UserDateController extends Controller {
  constructor() {
    super();
  }

  async AddUserDate() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      if (
        bodyData.dating_date &&
        !moment(bodyData.dating_date, "YYYY-MM-DD", true).isValid()
      ) {
        return _this.res.send({
          status: 0,
          message: "Invaild user date. Date should be in ['YYYY-MM-DD'] format",
        });
      }
      let userId = ObjectID(_this.req.user.userId);
      bodyData["user_id"] = userId;
      let storeDate = await new Model(UserDates).store(bodyData);
      if (_.isEmpty(storeDate)) {
        return _this.res.send({
          status: 0,
          message: langEn.error_save_data,
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Date is created successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Add Date Api",
        finction_name: "AddUserDate",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }
  async GetUserDate() {
    let _this = this;
    try {
      console.log(_this.req.body);
      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }
      if (!_this.req.body.user_id) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }
      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: -1 };
      let getAllDate = await UserDates.find({
        user_id: ObjectID(_this.req.body.user_id),
      })
        .sort(sort)
        .skip(skip)
        .limit(_this.req.body.pagesize);
      if (getAllDate.length > 0) {
        return _this.res.send({
          status: 1,
          message: "Date list returned successfully",
          data: getAllDate,
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Date list is empty",
          data: [],
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "get Date Api",
        finction_name: "GetUserDate",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }
  async sendDateRequest() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      if (!bodyData.date_id) {
        return _this.res.send({
          status: 0,
          message: "please send date id",
        });
      }
      let curr_date = new Date().toISOString().split("T");
      bodyData["accepted_date"] = curr_date;
      bodyData["user_id"] = _this.req.userId;
      bodyData["date_id"] = bodyData.date_id;
      let saveDateDetails = await new Model(DateDetails).store(bodyData);
      if (_.isEmpty(saveDateDetails)) {
        return _this.res.send({ status: 0, message: langEn.error_save_data });
      } else {
        return _this.res.send({
          status: 1,
          message: "Date request has been sent",
          data:saveDateDetails
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "send  date request Api",
        finction_name: "SendDateRequest",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }
  async AcceptDateRequest() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      let dateId = ObjectID(bodyData.date_id);
      if (!bodyData.date_id) {
        return _this.res.send({
          status: 0,
          message: "please send date id",
        });
      }
      let updateRequestStatus = await DateDetails.updateOne(
        {
          date_id: dateId,
          is_accepted: false,
        },
        { is_accepted: true }
      );

      if (!updateRequestStatus) {
        return _this.res.send({
          status: 0,
          message: "something went wrong",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "request has been accepted",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "accept  date request Api",
        finction_name: "Accept DateRequest",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }
  async SeeSentRequest() {
    let _this = this;
    try {
      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }

      let userId = ObjectID(_this.req.user.userId);
      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: -1 };

      let allRequest = await DateDetails.find({
        user_id: userId,
      })
        .sort(sort)
        .skip(skip)
        .limit(_this.req.body.pagesize);

      if (allRequest > 0) {
        return _this.res.send({
          status: 1,
          message: "Returned all requests",
          data: allRequest,
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "no request found",
          data: [],
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: " request  list Api",
        finction_name: "SeeSentRequest",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }
}

module.exports = UserDateController;

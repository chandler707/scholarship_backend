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

      return _this.res.send({
        status: 1,
        data: getAllDate,
      });

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

  async getUserInvitation() {
    let _this = this;
    try {
      console.log('body', _this.req.body, _this.req.user.userId);

      if (!_this.req.user.userId || !_this.req.body.page || !_this.req.body.pagesize) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }

      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: -1 };

      console.log("filter", { user_id: ObjectID(_this.req.user.userId), "status": true })

      let getAllDate = await UserDates.aggregate([
        {
          $match: { user_id: ObjectID(_this.req.user.userId), "status": true }
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: _this.req.body.pagesize,
        },
        {
          $lookup: {
            from: "date_details",
            let: { dateId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$date_id", "$$dateId"] },
                      { $eq: ["$is_accepted", false] },
                      { $eq: ["$is_ignored", false] },
                    ],
                  },
                },
              }
            ],
            as: "date_details",
          },
        },
        {
          $unwind: {
            path: "$date_details",
            preserveNullAndEmptyArrays: false // optional
          }
        },
        {
          $lookup: {
            from: "user_profiles",
            let: { userId: "$date_details.user_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"],
                  },
                },
              },
              {
                $project: { "user_profile": 1, "user_gender": 1, first_name: 1, last_name: 1 }
              }
            ],
            as: "user_profiles",
          },
        },
        {
          $unwind: {
            path: "$user_profiles",
            preserveNullAndEmptyArrays: false // optional
          }
        },
      ]);

      return _this.res.send({
        status: 1,
        data: getAllDate,
      });

    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "get Date Api",
        finction_name: "getUserInvitation",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async getDateDetail() {
    var _this = this;
    try {

      if (!_this.req.body.date_id) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }

      var dateId = ObjectID(_this.req.body.date_id);

      var dd = await UserDates.aggregate([
        {
          $match: { "_id": dateId }
        },
        {
          $lookup: {
            from: 'user_profiles',
            let: { userId: "$user_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"]
                  }
                }
              },
              { $project: { _id: 1, user_profile: 1, first_name: 1, last_name: 1, createdAt: 1 } }
            ],
            as: 'user_profiles',
          }
        },
        {
          $unwind: {
            path: "$user_profiles",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "date_details",
            let: { dateId: "$user_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$date_id", dateId],
                  },
                },
              }
            ],
            as: "date_details",
          },
        },
        {
          $unwind: {
            path: "$date_details",
            preserveNullAndEmptyArrays: true // optional
          }
        },
        {
          $lookup: {
            from: 'user_profiles',
            let: { userId: "$date_details.user_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"]
                  }
                }
              },
              { $project: { _id: 1, user_profile: 1, first_name: 1, last_name: 1, createdAt: 1 } }
            ],
            as: 'date_details.user_profiles',
          }
        },
        {
          $group: {
            _id: "$_id",
            "date_text": { $first: "$date_text" },
            "dating_date": { $first: "$dating_date" },
            "status": { $first: "$status" },
            "user_id": { $first: "$user_id" },
            "createdAt": { $first: "$createdAt" },
            "user_profiles": { $first: "$user_profiles" },
            date_details: { $push: "$date_details" }
          }
        }
      ])


      return _this.res.send({ status: 1, data: dd });
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "User Route Api",
        finction_name: "getDateDetail",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: lang.server_error });
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

      bodyData["user_id"] = _this.req.user.userId;
      bodyData["date_id"] = bodyData.date_id;
      let saveDateDetails = await new Model(DateDetails).store(bodyData);
      if (_.isEmpty(saveDateDetails)) {
        return _this.res.send({ status: 0, message: langEn.error_save_data });
      } else {
        return _this.res.send({
          status: 1,
          message: "Date request has been sent",
          data: saveDateDetails
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

      if (!bodyData.date_detail_id) {
        return _this.res.send({
          status: 0,
          message: "please send date id",
        });
      }

      let curr_date = new Date().toISOString().split("T");

      let dateId = ObjectID(bodyData.date_detail_id);
      let updateRequestStatus = await DateDetails.findByIdAndUpdate(
        {
          _id: dateId
        },
        { is_accepted: bodyData.is_accepted, is_ignored: bodyData.is_ignored, accepted_date: curr_date }
      );

      console.log("updateRequestStatus", updateRequestStatus)
      if (!updateRequestStatus) {
        return _this.res.send({
          status: 0,
          message: "something went wrong",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Request has been updated",
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

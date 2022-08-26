const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Users = require("../models/UserSchema").Users;
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Aggregation = require("../models/Aggregation");
const Sponcers = require("../models/SponcersSchema").Sponcers;
const SponcerActivities = require("../models/SponcerActivitySchema").SponcerActivities;
const SponserActivititySchedules = require("../models/SponserActivititySchedulesSchema").SponserActivititySchedules;
const SponserActivitiesUserInterests = require("../models/SponserActivitiesUserInterestsSchema").SponserActivitiesUserInterests;
const moment = require("moment");
let Form = require("../services/Form");
let File = require("../services/File");

class SponcerController extends Controller {
  constructor() {
    super();
  }

  async createSponcers() {
    let _this = this;
    try {

      let form = new Form(_this.req);
      let formObject = await form.parse();
      // console.log("form data", formObject);
      // console.log("form data field", formObject.fields);
      let bodyData = formObject.fields;

      var dataObj = {};

      if (bodyData.name && bodyData.name[0].trim().length > 0) {
        dataObj["name"] = bodyData.name[0].trim();
      }

      if (bodyData.description && bodyData.description[0].trim().length > 0) {
        dataObj["description"] = bodyData.description[0].trim();
      }

      if (bodyData.discount && bodyData.discount[0].trim().length > 0) {
        dataObj["discount"] = bodyData.discount[0].trim();
      }

      if (bodyData.location && bodyData.location[0].trim().length > 0) {
        dataObj["location"] = bodyData.location[0].trim();
      }

      if (bodyData.business_hours && bodyData.business_hours[0].trim().length > 0) {
        dataObj["business_hours"] = bodyData.business_hours[0].trim();
      }


      if (!dataObj.name || !dataObj.discount || !dataObj.location || !dataObj.business_hours) {
        return _this.res.send({
          status: 0,
          message: "Please send proper data",
        });
      }

      if (formObject.files && formObject.files.menu_image) {
        var fileKeys = []; //Object.keys(formObject.files)
        var menuImagesArr = await this.imageUploadFn(fileKeys, formObject.files.menu_image);
        dataObj['menu_image'] = menuImagesArr;
      }

      if (formObject.files['image']) {
        const file = new File(formObject.files['image']);
        let fileObject = await file.store("sponcers_image");
        var filepath = fileObject.filePartialPath;
        dataObj['image'] = filepath;
      }

      // let userId = ObjectID(_this.req.user.userId);
      // bodyData["user_id"] = userId;

      var bhrSplit = (dataObj.business_hours) ? dataObj.business_hours.split('-') : [];

      dataObj['business_hours_from'] = (bhrSplit[0]) ? bhrSplit[0] : "";
      dataObj['business_hours_to'] = (bhrSplit[1]) ? bhrSplit[1] : "";

      let storeDate = await new Model(Sponcers).store(dataObj);

      if (_.isEmpty(storeDate)) {
        return _this.res.send({
          status: 0,
          message: langEn.error_save_data,

        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Sponcers has been created successfully",
          sponcers_id: storeDate._id
        });
      }
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "createSponcers",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async imageUploadFn(fileKeys, files) {
    var _this = this;
    try {
      var imagArr = []
      return new Promise(async (resolve, reject) => {

        _this.imageUploadRecuringFn(fileKeys, files, imagArr, function (res) {
          resolve(res)
        })
      })

    } catch (error) {
      console.log("error", error)
    }
  }

  async imageUploadRecuringFn(fileKeys, files, imagArr, fn) {
    try {
      // if (fileKeys.length > 0) {
      //   var key = fileKeys[0];
      //   const file = new File(files[key]);
      //   let fileObject = await file.store("menu_images");
      //   var filepath = fileObject.filePartialPath;
      //   imagArr.push(filepath)
      //   fileKeys.splice(0, 1)
      //   i++
      //   this.imageUploadRecuringFn(fileKeys, files, imagArr, fn);
      // } else {
      //   fn(imagArr)
      // }

      if (files.length > 0) {
        var key = files[0];
        const file = new File([key]);
        let fileObject = await file.store("menu_images");
        var filepath = fileObject.filePartialPath;
        // console.log("filepath****", filepath)
        imagArr.push(filepath)
        files.splice(0, 1)
        this.imageUploadRecuringFn(fileKeys, files, imagArr, fn);
      } else {
        fn(imagArr)
      }

    } catch (error) {
      fn(imagArr)
      console.log("imageUploadRecuringFn Sponcer", error)
    }
  }

  async createSponcersActivities() {
    let _this = this;
    try {

      let form = new Form(_this.req);
      let formObject = await form.parse();
      // console.log("form data", formObject);
      // console.log("form data field", formObject.fields);
      let bodyData = formObject.fields;

      var dataObj = {};

      if (bodyData.title && bodyData.title[0].trim().length > 0) {
        dataObj["title"] = bodyData.title[0].trim();
      }

      if (bodyData.description && bodyData.description[0].trim().length > 0) {
        dataObj["description"] = bodyData.description[0].trim();
      }

      if (bodyData.sponcers_id && bodyData.sponcers_id[0].trim().length > 0) {
        dataObj["sponcers_id"] = bodyData.sponcers_id[0].trim();
      }

      if (!dataObj.title || !dataObj.sponcers_id) {
        return _this.res.send({
          status: 0,
          message: "Please send proper data",
        });
      }

      if (formObject.files['image']) {
        const file = new File(formObject.files['image']);
        let fileObject = await file.store("sponcers_image");
        var filepath = fileObject.filePartialPath;
        dataObj['image'] = filepath;
      }

      let storeDate = await new Model(SponcerActivities).store(dataObj);

      if (_.isEmpty(storeDate)) {
        return _this.res.send({
          status: 0,
          message: langEn.error_save_data,

        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Sponcers activity has been created successfully",
          sponcers_activity_id: storeDate._id
        });
      }
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "createSponcersActivities",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async createSponcersActivitiesSchedules() {
    let _this = this;
    try {

      var bodyData = _this.req.body;

      if (!bodyData.sponcer_activities_id || !bodyData.from || !bodyData.to) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }

      let storeDate = await new Model(SponserActivititySchedules).store(bodyData);

      if (_.isEmpty(storeDate)) {
        return _this.res.send({
          status: 0,
          message: langEn.error_save_data,

        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Activity schedule has been created successfully",
          schedule_id: storeDate._id
        });
      }
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "createSponcersActivitiesSchedules",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async sponcersActivitiesUserInterests() {
    let _this = this;
    try {

      var bodyData = _this.req.body;

      if (!bodyData.sponcer_activities_id || !_this.req.user.userId) {
        return _this.res.send({ status: 0, message: "please send user id" });
      }


      bodyData['user_id'] = _this.req.user.userId;

      let storeDate = await new Model(SponserActivitiesUserInterests).store(bodyData);

      if (_.isEmpty(storeDate)) {
        return _this.res.send({
          status: 0,
          message: langEn.error_save_data,

        });
      } else {
        return _this.res.send({
          status: 1,
          message: "Activity schedule has been created successfully",
          activity_interest_id: storeDate._id
        });
      }
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "sponcersActivitiesUserInterests",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async getAllSponcers() {
    var _this = this;
    try {

      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }
      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: -1 };

      var sponcerAll = await Sponcers.find({ "status": true }).sort(sort).skip(skip).limit(_this.req.body.pagesize);

      let tot = await Sponcers.countDocuments({});

      return _this.res.send({
        status: 1,
        data: sponcerAll,
        total: tot,
        pagesize: _this.req.body.pagesize,
        page: _this.req.body.page,
      });
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "getAllSponcers",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async sponcerSetails() {
    var _this = this
    try {

      var bodyData = _this.req.body;

      if (!bodyData.sponcer_id) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }
      let getAllData = await Sponcers.aggregate([
        {
          $match: { _id: ObjectID(bodyData.sponcer_id), "status": true }
        },
        {
          $lookup: {
            from: "sponcer_activities",
            let: { sponcersId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$sponcers_id", "$$sponcersId"] },
                      { $eq: ["$status", true] }
                    ],
                  },
                },
              }
            ],
            as: "sponcer_activities",
          },
        },
      ]);

      return _this.res.send({
        status: 1,
        data: (getAllData && getAllData.length > 0)?getAllData[0]:{},
      });
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "sponcerSetails",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

  async getActivitiesList() {
    var _this = this;
    try {

      if (!_this.req.body.page || !_this.req.body.pagesize) {
        return _this.res.send({ status: 0, message: "send proper data" });
      }
      let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
      let sort = { createdAt: -1 };

      var sponcerAll = await SponcerActivities.find({ "status": true }).sort(sort).skip(skip).limit(_this.req.body.pagesize);

      let tot = await SponcerActivities.countDocuments({});

      return _this.res.send({
        status: 1,
        data: sponcerAll,
        total: tot,
        pagesize: _this.req.body.pagesize,
        page: _this.req.body.page,
      });
    } catch (error) {
      console.log("error000", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Sponcers Api",
        finction_name: "getAllSponcers",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: langEn.server_error });
    }
  }

}

module.exports = SponcerController;

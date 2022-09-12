const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const langEn = require("../../configs/en");
const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const Attribute = require("../models/AttributesSchema").Attribute;
const AttributeValue = require("../models/AttributesSchema").AttributeValue;

class AttributesController extends Controller {
  constructor() {
    super();
  }

  async AddAttribute() {
    let _this = this;
    try {
      if (!_this.req.body.attribute) {
        return _this.res.send({
          status: 0,
          message: "please send attribute name",
        });
      }
      let bodyData = _this.req.body;
      let attData = await new Model(Attribute).store(bodyData);
      if (_.isEmpty(attData)) {
        return _this.res.send({
          status: 0,
          message: "error in saving data",
        });
      } else {
        return _this.res.send({
          status: 1,
          message: "attribute added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "addAttribute",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async GetAttribute() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let attList = await Attribute.find({ is_delete: false });
        if (attList.length > 0) {
          return _this.res.send({
            status: 1,
            message: "attribute list returned",
            data: attList,
          });
        } else {
          return _this.res.send({
            status: 1,

            data: [],
          });
        }
      }
      if (!_this.req.body.attribute_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return _this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let attList = await Attribute.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await Attribute.countDocuments({ is_delete: false });
        if (attList != null) {
          if (attList.length > 0) {
            return _this.res.send({
              status: 1,
              message: "attribute list returned",
              data: attList,
              count: count,
            });
          } else {
            return _this.res.send({
              status: 1,
              message: "attribute list is empty",
              data: [],
            });
          }
        }
      } else {
        let single = await Attribute.findOne({
          _id: ObjectID(_this.req.body.attribute_id),
          is_delete: false,
        });

        if (!_.isEmpty(single)) {
          return _this.res.send({
            status: 1,
            message: "attribute  returned",
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
        function_name: "GetAttribute",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async UpdateAttribute() {
    let _this = this;
    try {
      if (!_this.req.body.attribute_id) {
        return _this.res.send({
          status: 0,
          message: "please send attribute id",
        });
      }
      if (!_this.req.body.is_delete) {
        let bodyData = _this.req.body;
        let update = await Attribute.findByIdAndUpdate(
          {
            _id: ObjectID(_this.req.body.attribute_id),
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
            message: "attribute updated successfully",
          });
        }
      } else {
        let del = await Attribute.findByIdAndUpdate(
          { _id: ObjectID(_this.req.body.attribute_id), is_delete: false },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(del)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          let deleteValueByAttribute = await AttributeValue.updateMany(
            {
              attribute_id: del._id,
            },
            {
              is_delete: true,
            }
          );
          return _this.res.send({
            status: 1,
            message: "attribute deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "UpdateAttribute",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }

  async AddAttributeValues() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      if (!bodyData.attribute_id) {
        return _this.res.send({ status: 0, message: "send attribute id" });
      }
      let addAttributeVal = await new Model(AttributeValue).store(bodyData);
      if (_.isEmpty(addAttributeVal)) {
        return _this.res.send({ status: 0, message: "error in add data" });
      } else {
        return _this.res.send({
          status: 1,
          message: "Attribute value added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "AddAttributeValues",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetAttributeValues() {
    let _this = this;
    try {
      if (_this.req.body.is_all) {
        let getAttribute;
        if (!_this.req.body.attribute_id) {
          getAttribute = await AttributeValue.find({
            is_delete: false,
          }).populate("attribute_id");
        } else {
          getAttribute = await AttributeValue.find({
            attribute_id: ObjectID(_this.req.body.attribute_id),
            is_delete: false,
          });
        }
        console.log(getAttribute);
        if (getAttribute.length > 0) {
          return _this.res.send({
            status: 1,
            message: "attribute returned successfully",
            data: getAttribute,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "attribute list is empty",
            data: [],
          });
        }
      }
      if (_this.req.body.is_front) {
        let findId = await Attribute.findOne({
          attribute: _this.req.body.attribute,
          is_delete: false,
        });
        if (!_.isEmpty(findId)) {
          let findVal = await AttributeValue.find({
            attribute_id: ObjectID(findId._id),
            is_delete: false,
          });
          if (findVal.length > 0) {
            return _this.res.send({
              status: 1,
              message: "data success",
              data: findVal,
            });
          } else {
            return _this.res.send({
              status: 0,
              message: "nothing found",
              data: [],
            });
          }
        } else {
          return _this.res.send({
            status: 0,
            message: "nothing found",
            data: [],
          });
        }
      }
      if (!_this.req.body.attribute_value_id) {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };

        let getAttVal = await AttributeValue.find({
          attribute_id: ObjectID(_this.req.body.attribute_id),
          is_delete: false,
        })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pazesize);
        let count = await AttributeValue.countDocuments({
          attribute_id: ObjectID(_this.req.body.attribute_id),
          is_delete: false,
        });

        if (getAttVal.length > 0) {
          return _this.res.send({
            status: 1,
            message: "Attribute values returned",
            data: getAttVal,
            count: count,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "No attribute value was found",
            data: [],
            count: 0,
          });
        }
      } else {
        let getAttributeVal = await AttributeValue.findOne({
          _id: ObjectID(_this.req.body.attribute_value_id),
          is_delete: false,
        });
        if (!_.isEmpty(getAttributeVal)) {
          return _this.res.send({
            status: 1,
            message: "Attribute value returned successfully",
            data: getAttributeVal,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "No data",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "GetAttributeValues",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async UpdateAttributeValues() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      if (!bodyData.attribute_value_id) {
        return _this.res.send({
          status: 0,
          message: "send attribute value id ",
        });
      }
      if (!bodyData.is_delete) {
        let updateAttributeVal = await AttributeValue.findByIdAndUpdate(
          {
            _id: ObjectID(bodyData.attribute_value_id),
          },
          bodyData
        );
        if (_.isEmpty(updateAttributeVal)) {
          return _this.res.send({ status: 0, message: "error in update data" });
        } else {
          return _this.res.send({
            status: 1,
            message: "Attribute value updated successfully",
          });
        }
      } else {
        let deleteAttribute = await AttributeValue.findByIdAndUpdate(
          {
            _id: ObjectID(bodyData.attribute_value_id),
          },
          { is_delete: true }
        );
        if (_.isEmpty(deleteAttribute)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "Attribute value deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "UpdateAttributeValues",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
}

module.exports = AttributesController;

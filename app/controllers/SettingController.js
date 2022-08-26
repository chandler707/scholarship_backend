const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;
const Globals = require("../../configs/Globals");
const Model = require("../models/Model");
const FAQ = require("../models/SettingSchema").FAQ;
const AboutUs = require("../models/SettingSchema").AboutUs;
const ContactUs = require("../models/SettingSchema").ContactUs;
const PrivacyPolicy = require("../models/SettingSchema").PrivacyPolicy;
const WorkingPolicy = require("../models/SettingSchema").WorkingPolicy;
const TermAndCondition = require("../models/SettingSchema").TermAndCondition;
const _ = require("lodash");

class SettingController extends Controller {
  constructor() {
    super();
  }

  async AddFaq() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      let addFaq = await new Model(FAQ).store(bodyData);
      if (_.isEmpty(addFaq)) {
        return _this.res.send({ status: 0, message: "error in add data" });
      } else {
        return _this.res.send({
          status: 1,
          message: "Faq added successfully",
        });
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "AddFaq",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetFaq() {
    let _this = this;
    try {
      if (_this.req.body.faq_id) {
        let singleFaq = await FAQ.findOne({
          _id: ObjectID(_this.req.body.faq_id),
          is_delete: false,
        });
        if (!_.isEmpty(singleFaq)) {
          return _this.res.send({
            status: 1,
            message: "Faq returned successfully",
            data: singleFaq,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "nothing found",
          });
        }
      } else {
        if (!_this.req.body.page || !_this.req.body.pagesize) {
          return this.res.send({
            status: 0,
            message: "Please send proper data.",
          });
        }

        let skip = (_this.req.body.page - 1) * _this.req.body.pagesize;
        let sort = { createdAt: -1 };
        let getFaq = await FAQ.find({ is_delete: false })
          .sort(sort)
          .skip(skip)
          .limit(_this.req.body.pagesize);
        let count = await FAQ.countDocuments({ is_delete: false });
        if (getFaq.length > 0) {
          return _this.res.send({
            status: 1,
            message: "Faq returned successfully",
            data: getFaq,
            count: count,
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "faq list is empty",
            data: [],
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "GetFaq",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async UpdateFaq() {
    let _this = this;
    try {
      let bodyData = _this.req.body;
      if (!bodyData.faq_id) {
        return _this.res.send({ status: 0, message: "send faq id " });
      }
      if (!_this.req.body.is_delete) {
        let updateFaq = await FAQ.findByIdAndUpdate(
          {
            _id: ObjectID(bodyData.faq_id),
            is_delete: false,
          },
          bodyData,
          { new: true }
        );
        if (_.isEmpty(updateFaq)) {
          return _this.res.send({ status: 0, message: "error in update data" });
        } else {
          return _this.res.send({
            status: 1,
            message: "Faq updated successfully",
          });
        }
      } else {
        let deleteFaq = await FAQ.findByIdAndUpdate(
          {
            _id: ObjectID(bodyData.faq_id),
            is_delete: false,
          },
          { is_delete: true },
          { new: true }
        );
        if (_.isEmpty(deleteFaq)) {
          return _this.res.send({
            status: 0,
            message: "error in deleting data",
          });
        } else {
          return _this.res.send({
            status: 1,
            message: "faq deleted successfully",
          });
        }
      }
    } catch (error) {
      console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "Admin Route Api",
        function_name: "UpdateFaq",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetContactUs() {
    let _this = this;
    try {
      let getContactUs = await ContactUs.findOne();

      if (!_.isEmpty(getContactUs)) {
        return _this.res.send({
          status: 1,
          message: "Contact us returned successfully",
          data: getContactUs,
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
        function_name: "GetContactUs",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async UpdateContactUs() {
    let _this = this;
    try {
      console.log("this is ", _this.req.body);
      if (!_this.req.body.contactus_id) {
        return _this.res.send({ status: 0, message: "please send id" });
      }
      let updateContactUs = await ContactUs.findByIdAndUpdate(
        {
          _id: _this.req.body.contactus_id,
        },
        {
          contact_us: _this.req.body.contact_us,
        },
        { new: true }
      );

      if (!_.isEmpty(updateContactUs)) {
        return _this.res.send({
          status: 1,
          message: "Contact us updated successfully",
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
        function_name: "updateContactUs",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async GetAbouttUs() {
    let _this = this;
    try {
      let getAboutUs = await AboutUs.findOne();

      if (!_.isEmpty(getAboutUs)) {
        return _this.res.send({
          status: 1,
          message: "About us returned successfully",
          data: getAboutUs,
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
        function_name: "GetAboutUs",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async UpdateAboutUs() {
    let _this = this;
    try {
      if (!_this.req.body.aboutus_id) {
        return _this.res.send({ status: 0, message: "please send id" });
      }
      let updateAboutUs = await AboutUs.findByIdAndUpdate(
        {
          _id: _this.req.body.aboutus_id,
        },
        {
          about_us: _this.req.body.about_us,
        },
        { new: true }
      );

      if (!_.isEmpty(updateAboutUs)) {
        return _this.res.send({
          status: 1,
          message: "About us updated successfully",
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
        function_name: "updateAboutUs",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async GetPrivacyPolicy() {
    let _this = this;
    try {
      let getpolicy = await PrivacyPolicy.findOne();
      console.log("policy", getpolicy);

      if (!_.isEmpty(getpolicy)) {
        return _this.res.send({
          status: 1,
          message: "privacy policy returned successfully",
          data: getpolicy,
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
        function_name: "GetPrivacyPolicy",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async UpdatePrivacyPolicy() {
    let _this = this;
    try {
      if (!_this.req.body.privacypolicy_id) {
        return _this.res.send({ status: 0, message: "please send id" });
      }
      let updatePolicy = await PrivacyPolicy.findByIdAndUpdate(
        {
          _id: _this.req.body.privacypolicy_id,
        },
        {
          privacy_policy: _this.req.body.privacy_policy,
        },
        { new: true }
      );

      if (!_.isEmpty(updatePolicy)) {
        return _this.res.send({
          status: 1,
          message: "privacy policy updated successfully",
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
        function_name: "updatePrivacyPolicy",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async GetTermAndCondition() {
    let _this = this;
    try {
      let getTerm = await TermAndCondition.findOne();

      if (!_.isEmpty(getTerm)) {
        return _this.res.send({
          status: 1,
          message: " returned successfully",
          data: getTerm,
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
        function_name: "GetTermAndCondition",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async UpdateTermAndCondition() {
    let _this = this;
    try {
      if (!_this.req.body.termandcondition_id) {
        return _this.res.send({ status: 0, message: "please send id" });
      }
      let updateTerm = await TermAndCondition.findByIdAndUpdate(
        {
          _id: ObjectID(_this.req.body.termandcondition_id),
        },
        {
          term_and_condition: _this.req.body.term_and_condition,
        },
        { new: true }
      );

      if (!_.isEmpty(updateTerm)) {
        return _this.res.send({
          status: 1,
          message: " updated successfully",
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
        function_name: "updateTermAndCondition",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }

  async GetWorkingPolicy() {
    let _this = this;
    try {
      let getreturn = await WorkingPolicy.findOne();

      if (!_.isEmpty(getreturn)) {
        return _this.res.send({
          status: 1,
          message: "working policy returned successfully",
          data: getreturn,
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
        function_name: "GetWorkingPolicy",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
  async UpdateWorkingPolicy() {
    let _this = this;
    try {
      if (!_this.req.body.working_id) {
        return _this.res.send({ status: 0, message: "please send id" });
      }
      let updateReturn = await WorkingPolicy.findByIdAndUpdate(
        {
          _id: _this.req.body.working_id,
        },
        {
          working_policy: _this.req.body.working_policy,
        },
        { new: true }
      );

      if (!_.isEmpty(updateReturn)) {
        return _this.res.send({
          status: 1,
          message: "working policy updated successfully",
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
        function_name: "updateWorkingPolicy",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "server error" });
    }
  }
}

module.exports = SettingController;

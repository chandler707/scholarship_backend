var mongoose = require("mongoose");
var schema = mongoose.Schema;

var faqSchema = new schema(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var contactUsSchema = new schema(
  {
    contact_us: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var aboutUsSchema = new schema(
  {
    about_us: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var privacySchema = new schema(
  {
    privacy_policy: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var workingPolicySchema = new schema(
  {
    working_policy: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var termandconditionSchema = new schema(
  {
    term_and_condition: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var FAQ = mongoose.model("faq", faqSchema);
var ContactUs = mongoose.model("contact_us", contactUsSchema);
var AboutUs = mongoose.model("about_us", aboutUsSchema);
var PrivacyPolicy = mongoose.model("privacy_policy", privacySchema);
var WorkingPolicy = mongoose.model("working_policy", workingPolicySchema);
var TermAndCondition = mongoose.model(
  "term_and_condition",
  termandconditionSchema
);

module.exports = {
  FAQ,
  ContactUs,
  AboutUs,
  PrivacyPolicy,
  TermAndCondition,
  WorkingPolicy,
};

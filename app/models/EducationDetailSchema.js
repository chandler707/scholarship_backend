var mongoose = require("mongoose");
var schema = mongoose.Schema;

var education = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    bachelor_degree: { type: String, default: "" },
    country_of_education: { type: String, default: "" },
    bachelor_degree_score: { type: String, default: "" },
    bachelor_degree_year: { type: String, default: "" },
    bachelor_degree_date: { type: String, default: "" },
    bachelor_degree_marksheet: { type: String, default: "" },
    bachelor_degree_subject: { type: String, default: "" },

    tenth_score: { type: String, default: "" },
    tenth_marksheet: { type: String, default: "" },
    tenth_year: { type: String, default: "" },
    tenth_date: { type: String, default: "" },
    school_country: {
      type: String,
      default: "",
    },

    twelfth_score: { type: String, default: "" },
    twelfth_marksheet: { type: String, default: "" },
    twelfth_year: { type: String, default: "" },
    twelfth_date: { type: String, default: "" },
    twelfth_subject: { type: String, default: "" },

    master_degree: { type: String, default: "" },
    master_degree_score: { type: String, default: "" },
    master_degree_year: { type: String, default: "" },
    master_degree_date: { type: String, default: "" },
    master_degree_marksheet: { type: String, default: "" },
    master_degree_subject: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var EducationDetails = mongoose.model("education_details", education);

module.exports = {
  EducationDetails,
};

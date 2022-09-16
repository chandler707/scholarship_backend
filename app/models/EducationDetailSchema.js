var mongoose = require("mongoose");
var schema = mongoose.Schema;

var education = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    highest_education: { type: String, default: "" },
    country_of_education: { type: String, default: "" },
    grade_average: { type: String, default: "" },
    school_start: { type: String, default: "" },
    school_end: { type: String, default: "" },
    school_country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student_countries",
      index: true,
    },
    school_state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student_states",
      index: true,
    },
    school_zip: { type: String, default: "" },
    school_address: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var EducationDetails = mongoose.model("education_details", education);

module.exports = {
  EducationDetails,
};

var mongoose = require("mongoose");
var schema = mongoose.Schema;

var courses = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_category",
      index: true,
    },
    course_name: { type: String, default: false },
    is_delete: { type: Boolean, default: false },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attribute_values",
      index: true,
    },
    total_course_fees: { type: String, default: "" },
    course_duration: { type: Number, default: "" },
    course_level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attribute_values",
      index: true,
    },
    course_program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attribute_values",
      index: true,
    },
    admission: { type: String, default: "" },
    work_experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attribute_values",
      index: true,
    },
    eligibility: { type: String, default: "" },
    course_language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      index: true,
    },
    required_degress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attribute_values",
      index: true,
    },
    fees: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

var Course = mongoose.model("courses", courses);

module.exports = {
  Course,
};

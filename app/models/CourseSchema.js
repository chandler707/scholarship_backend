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
      ref: "course_categories",
      index: true,
    },
    course_name: { type: String, default: false },
    is_delete: { type: Boolean, default: false },
    type: { type: String, default: "" },
    total_course_fees: { type: Number, default: "" },
    course_duration: { type: Number, default: "" },
    course_level: { type: String, default: "" },
    course_program: { type: String, default: "" },
    admission: { type: Date, default: "" },
    work_experience: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    course_language: { type: String, default: "" },
    required_degress: { type: String, default: "" },
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

var mongoose = require("mongoose");
var schema = mongoose.Schema;

var courses_category = new schema(
  {
    category_name: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var CourseCategory = mongoose.model("course_category", courses_category);

module.exports = {
  CourseCategory,
};

var mongoose = require("mongoose");
var schema = mongoose.Schema;

var application = new schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      index: true,
    },
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    status: { type: String, default: "pending" },

    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var Application = mongoose.model("applications", application);

module.exports = {
  Application,
};

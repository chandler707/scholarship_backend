var mongoose = require("mongoose");
var schema = mongoose.Schema;

var courseTypeSchema = new schema(
  {
    course_type: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var courseLevelSchema = new schema(
  {
    course_level: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var courseProgramSchema = new schema(
  {
    course_type: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var courseDurationSchema = new schema(
  {
    course_duration: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var workExpSchema = new schema(
  {
    course_experience: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var requiredDegreeSchema = new schema(
  {
    required_degree: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var gradingSchema = new schema(
  {
    grading: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var gradingAverage = new schema(
  {
    grading_average: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var entranceExam = new schema(
  {
    entrance_exam: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var CourseType = mongoose.model("course_type", courseTypeSchema);
var CourseLevel = mongoose.model("course_level", courseLevelSchema);
var CourseProgram = mongoose.model("course_program", courseProgramSchema);
var CourseDuration = mongoose.model("course_duration", courseDurationSchema);
var CourseExperience = mongoose.model("work_experience", workExpSchema);
var RequiredDegree = mongoose.model("required_degree", requiredDegreeSchema);
var Grading = mongoose.model("grading", gradingSchema);
var GradingAverage = mongoose.model("grading_average", gradingAverage);
var EntranceExam = mongoose.model("entrance_exam", entranceExam);

module.exports = {
  CourseType,
  CourseLevel,
  CourseProgram,
  CourseDuration,
  CourseExperience,
  RequiredDegree,
  Grading,
  GradingAverage,
  EntranceExam,
};

var mongoose = require("mongoose");
var schema = mongoose.Schema;

var university_detail = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    university_type: { type: String, default: "" },
    established_year: { type: Number, default: "" },
    world_rank: { type: Number, default: "" },
    rating: { type: Number, default: "" },
    accomodation: { type: Boolean, default: false },
    scholarship: { type: Boolean, default: false },
    part_time_work: { type: Boolean, default: false },
    about: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var UniversityDetails = mongoose.model("university_details", university_detail);

module.exports = {
  UniversityDetails,
};

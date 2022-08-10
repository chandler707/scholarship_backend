var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userPreferanceSchema = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    search_preferred_gender: { type: String, default: "" },
    user_gender: { type: String, default: "" },
    user_age: { type: Number, default: "" },
    search_preferred_radius: { type: Number, default: "" },
    is_radius_from_location: { type: Boolean, default: false },
    is_radius_from_current_location: { type: Boolean, default: false },
    preferred_age_from: { type: Number, default: 0 },
    preferred_age_to: { type: Number, default: 0 },
    user_address: { type: String, default: "" },
    location: {}, //{ type : "Point", coordinates : [0, 0] }
    status: { type: Boolean, default: true },
    location_type: { type: String, default: '' }
  },
  {
    timestamps: true,
  }
);

var UserPreferances = mongoose.model("user_preferances", userPreferanceSchema);
module.exports = {
  UserPreferances,
};

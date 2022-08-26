var mongoose = require("mongoose");
var schema = mongoose.Schema;

var profileSchema = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    user_gender: { type: String, default: "" },
    user_profile: { type: String, default: "" },
    user_dob: { type: Date, default: "" },
    about_me: { type: String, default: "" },
    user_age_group: { type: Array, default: [] },
    user_age_group_str: { type: String, default: "" },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    user_phone: { type: Number, default: "" },
    user_curent_location: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    post_code: { type: String, default: "" },
    address: { type: String, default: "" },
    height: { type: String, default:"" },
    activity_level: { type: String, default: "" },
    education_level: { type: String, default: "" },
    drinking_preference: { type: String, default: "" },
    smoking_preference: { type: String, default: "" },
    pets: { type: String, default: "" },
    kids: { type: String, default: "" },
    zodiac_sign: { type: String, default: "" },
    political_affiliation: { type: String, default: "" },
    religious_affiliation: { type: String, default: "" },
    nation_origion: { type: String, default: "" },
    language: { type: String, default: "" },
    favorite_activities: { type: String, default: "" },
    current_job: { type: String, default: "" },
    school_attending: { type: String, default: "" },
    favorite_places: { type: String, default: "" },
    status: { type: Boolean, default: true },
    miles: { type: Number, default: 0 },
    
  },
  {
    timestamps: true,
  }
);

var UserProfiles = mongoose.model("user_profiles", profileSchema);
module.exports = {
  UserProfiles,
};

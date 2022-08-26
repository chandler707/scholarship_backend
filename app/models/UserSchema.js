var mongoose = require("mongoose");
var schema = mongoose.Schema;
var crypto = require("crypto");

<<<<<<< HEAD
var user = new schema(
  {
    email: { type: String, default: "" },
    mobile: { type: Number, default: "" },
    name: { type: String, default: "" },
    password: { type: String, default: "" },
    official_website: { type: String, default: "" },
    user_type: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    is_approved: { type: Boolean, default: false },
    country: { type: String, default: "" },
    pincode: { type: Number, default: "" },
    father_name: { type: String, default: "" },
    first_language: { type: String, default: "" },
    dob: { type: Date, default: "" },
    gender: { type: String, default: "" },
    citizenship_country: { type: String, default: "" },
    passport_number: { type: String, default: "" },
    marital_status: { type: String, default: "" },
    alternative_mobile: { type: Number, default: "" },
    profile_picture: { type: String, default: "" },
=======
var user = new schema({
    username: { type: String, default: "" },
    user_email: { type: String, default: "" },
    user_password: { type: String, default: "" },    
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      index: true,
    },
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
    user_verificationStatus: { type: Boolean, default: false },
    user_status: { type: String, default: "inactive" },
    user_verificationToken: { type: String, default: "" },
    user_forgotToken: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
    is_block: { type: Boolean, default: false },
    social_full_json: { type: String, default: "" },
    push_notification_status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var Users = mongoose.model("users", user);

module.exports = {
  Users,
};

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var crypto = require('crypto');

var user = new schema({
    username: { type: String, default: "" },
    user_email: { type: String, default: "" },
    user_firstname: { type: String, default: "" },
    user_lastname: { type: String, default: "" },
    user_fullname: { type: String, default: "" },
    user_password: { type: String, default: "" },
    user_gender: { type: String, default: "" },
    user_dob: { type: Date, default: "" },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', index: true },
    user_address: { type: String, default: "" },
    user_ip: { type: String, default: "" },
    user_verificationStatus: { type: Boolean, default: false },
    user_status: { type: String, default: "inactive" },
    user_verificationToken: { type: String, default: "" },
    user_forgotToken: { type: String, default: "" },
    user_login_time: { type: Date, default: "" },
    user_logout_time: { type: Date, default: "" },
    lat: { type: Number, default: "" },
    long: { type: Number, default: "" },
    login_type: { type: String, default: "" },
    device_id: { type: String, default: "" },
    device_token: { type: String, default: "" },
    device_type: { type: String, default: "" },
    os_type: { type: String, default: "" },
    delete_status: { type: Boolean, default: false },
    social_full_json: { type: String, default: "" },
    is_hide_dob: { type: Boolean, default: false },
    facebook_link: { type: String, default: "https://www.facebook.com/" },
    instagram_link: { type: String, default: "https://www.instagram.com/" },
    twitter_link: { type: String, default: "https://twitter.com/" },
    linkedin_link: { type: String, default: "https://www.linkedin.com/" },
    youtube_link: { type: String, default: "https://www.youtube.com/" },
    website_link: { type: String, default: "" },
    push_notification_status: { type: Boolean, default: true },

}, {
    timestamps: true
});



var Users = mongoose.model('User', user);

module.exports = {
    Users
}
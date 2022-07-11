var mongoose = require('mongoose');
var schema = mongoose.Schema;
var crypto = require('crypto');

var user = new schema({
    username : {type:String, default:""},
    user_email : {type : String, default:""},
    user_firstname : {type:String, default:""},
    user_lastname : {type:String, default:""},
    user_fullname : {type:String, default:""},
    user_password : { type: String, default:""},
    user_photo : {type : String, default:""},    
    user_gender:{type:String, default:""},
    user_role:{type:String, default:"user"},
    user_address:{type:String, default:""},
    user_dob:{type:Date , default:""},
    user_age_group:{type:Array , default:[]},
    user_age_group_str:{type:String, default:""},
    user_phone : { type: Number, default:""}, 
    user_ip : { type: String, default:""},
    user_curent_location : { type: String, default:""},
    user_verificationStatus : {type:Boolean,  default:false},
    user_status: { type: String, default:"inactive"},
    user_verificationToken: {type:String, default:""},
    user_forgotToken: {type:String, default:""},
    user_login_time:{type:Date, default:""},
    user_logout_time:{type:Date, default:""},
    city:{type:String, default:""},
    state:{type:String, default:""},
    country:{type:String, default:""},
    login_type:{type:String, default:""},
    device_id:{type:String, default:""},
    device_token:{type:String, default:""},
    device_type:{type:String, default:""},
    os_type:{type:String, default:""},    
    delete_status:{ type:Boolean, default:false},    
    reset_code:{type:Number, default:""},
    localization:{type:String, default:""},
    social_full_json : {type:String, default:""},
    showkt_id: {type:String, default:""},
    is_hide_dob: {type:Boolean,  default:false},
    is_profile: {type:Boolean,  default:false},
    otp: {type:String, default:""},
    otp_increement: {type:Number, default:0},
    pass_code: {type:String, default:""},
    pass_auth_key: {type:String, default:""},
    country_code: {type:String, default:""},
    user_bio: {type:String, default:""},
    facebook_link: {type:String, default:"https://www.facebook.com/"},
    instagram_link: {type:String, default:"https://www.instagram.com/"},
    twitter_link: {type:String, default:"https://twitter.com/"},
    linkedin_link: {type:String, default:"https://www.linkedin.com/"},
    youtube_link: {type:String, default:"https://www.youtube.com/"},
    website_link: {type:String, default:""},
    account_type: {type:String, default:"normal"},
    profile_type: {type:String, default:"public"},
    user_category: [],
    user_language: [],
    followers_count: {type:Number, default:0},
    following_count: {type:Number, default:0},
    total_post: {type:Number, default:0},
    push_notification_status: {type:Boolean, default:true},
    comment_notification_status: {type:Boolean, default:true},
    like_notification_status: {type:Boolean, default:true},
    follow_notification_status: {type:Boolean, default:true},
},{
    timestamps:true
});



var Users = mongoose.model('User', user);

module.exports = {
    Users
}
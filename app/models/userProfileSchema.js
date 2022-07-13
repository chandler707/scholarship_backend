var mongoose = require('mongoose');
var schema = mongoose.Schema;

var profileSchema = new schema({
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    about_me: {type:String, default:""},
    user_age_group:{type:Array , default:[]},
    user_age_group_str:{type:String, default:""},
    user_phone : { type: Number, default:""}, 
    user_curent_location : { type: String, default:""},
    city:{type:String, default:""},
    state:{type:String, default:""},
    country:{type:String, default:""},
    height: {type:Number, default:0},
    activity_level: {type:String, default:""},
    education_level: {type:String, default:""},
    driking_preference: {type:String, default:""},
    smoking_preference: {type:String, default:""},
    pets: {type:String, default:""},
    kids: {type:String, default:""},
    zodiac_sign: {type:String, default:""},
    political_affiliation: {type:String, default:""},
    religious_affiliation: {type:String, default:""},
    nation_of_origin: {type:String, default:""},
    language: [],
    favorite_activities: {type:String, default:""},
    current_job: {type:String, default:""},
    school_attending: {type:String, default:""},
    favorite_places: {type:String, default:""},
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var userProfiles = mongoose.model('user_profiles', profileSchema);
module.exports = {
    userProfiles
}
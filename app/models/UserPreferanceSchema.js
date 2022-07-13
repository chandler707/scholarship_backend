var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userPreferanceSchema = new schema({
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    search_preferred_gender : {type:String, default:""},
    search_preferred_radius : {type:Double, default:""},
    is_radius_from_location : {type:Boolean, default:false},
    is_radius_from_current_location : {type:Boolean, default:false},
    preferred_age_from : {type:Number, default:0},
    preferred_age_to : {type:Number, default:0},
    user_address: { type: String, default: "" },
    location : {}, //{ type : "Point", coordinates : [0, 0] }
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var userPreferances = mongoose.model('user_preferances', userPreferanceSchema);
module.exports = {
    userPreferances
}
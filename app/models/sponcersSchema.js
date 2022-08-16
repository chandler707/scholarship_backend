var mongoose = require('mongoose');
var schema = mongoose.Schema;

var sponcerSchema = new schema({
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    name : {type:String, default:""},
    image : {type:String, default:""},
    description : {type:String, default:""},
    discount : {type:String, default:""},
    location : {type:String, default:""},
    business_hours : [],
    business_hours_from : {type:String, default:""},
    business_hours_to : {type:String, default:""},
    activities : {type:String, default:""},
    menu_image : [],
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var Sponcers = mongoose.model('sponcers', sponcerSchema);
module.exports = {
    Sponcers
}
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var sponcerActivitySchema = new schema({
    sponcers_id : { type: mongoose.Schema.Types.ObjectId, ref: 'sponcers', index: true },  
    title : {type:String, default:""},
    image : {type:String, default:""},
    description : {type:String, default:""},
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var SponcerActivities = mongoose.model('sponcer_activities', sponcerActivitySchema);
module.exports = {
    SponcerActivities
}
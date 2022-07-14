var mongoose = require('mongoose');
var schema = mongoose.Schema;

var dateDetailsSchema = new schema({
    date_id : { type: mongoose.Schema.Types.ObjectId, ref: 'user_dates', index: true },  
    sponcers_date_ideas_id : { type: mongoose.Schema.Types.ObjectId, ref: 'sponcers_date_ideas', index: true },  
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    accepted_date: { type: Date, default: "" },
    is_accepted: {type:Boolean, default:false},
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var dateDetails = mongoose.model('date_details', dateDetailsSchema);
module.exports = {
    dateDetails
}
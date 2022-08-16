var mongoose = require('mongoose');
var schema = mongoose.Schema;

var SponserActivititySchedulesSchema = new schema({
    sponcer_activities_id : { type: mongoose.Schema.Types.ObjectId, ref: 'sponcer_activities', index: true },  
    from : {type:Date, default:""},
    to : {type:Date, default:""},
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var SponserActivititySchedules = mongoose.model('sponcer_activities_schedules', SponserActivititySchedulesSchema);
module.exports = {
    SponserActivititySchedules
}
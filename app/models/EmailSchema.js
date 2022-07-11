const mongoose = require('mongoose');

const email = new mongoose.Schema({
    email : {type:String, default:"NA"},
    status : {type:String, default:"NA"},
    job_id : { type: mongoose.Schema.Types.ObjectId, ref: 'Jobpost' },
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    template_id : {type:String, default:"NA"},
    description : { type:String, default:"NA"},
    email_type: { type:String, default:"NA"},
    deletestatus :{ type:Boolean, default:false}
},{
    timestamps:true
});

const Emaillogs = mongoose.model('emaillog', email);
module.exports = {
    Emaillogs
}
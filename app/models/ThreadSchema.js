var mongoose = require('mongoose');
var schema = mongoose.Schema;
var crypto = require('crypto');

var threadSchema = new schema({
	user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    connector_id : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject : {type:String, default:"NA"},
    last_msg : {type:String, default:"NA"},
    delete_status : {type:Boolean, default:false}
},{
    timestamps:true
});

var Threads = mongoose.model('Threads', threadSchema);

module.exports = {
    Threads
}
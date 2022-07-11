var mongoose = require('mongoose');
var schema = mongoose.Schema;
var crypto = require('crypto');

var conversationSchema = new schema({
    thread_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'threads' },       
    sender_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    receiver_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message : {type:String, default:""},
    sent_status : {type:Boolean, default:false},
    receive_status : {type:Boolean, default:false},
    read_status : {type:Boolean, default:false},
    flag_status : {type:String, default:""},
    delete_status : {type:Boolean, default:false},
},{
    timestamps:true
});

var Conversations = mongoose.model('conversations', conversationSchema);

module.exports = {
    Conversations
}
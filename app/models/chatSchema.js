var mongoose = require('mongoose');
var schema = mongoose.Schema;

var chatSchema = new schema({
    sender_user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    receiver_user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true }, 
    subject : {type:String, default:"NA"},
    last_msg : {type:String, default:"NA"},
    is_blocked: {type:Boolean, default:false},
    status: {type:Boolean, default:true},
},{
    timestamps:true
});

var Chats = mongoose.model('chats', chatSchema);
module.exports = {
    Chats
}
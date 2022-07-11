const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },
    post_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'posts', index: true },
    post_user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'posts', index: true },
    body_msg:{type:String, default:null},
    title:{type:String, default:null},
    notify_type:{type:String, default:null},    
    summery:{type:Object, default:null},
    target_screen:{type:Object, default:null},
    thumbnail:{type:Object, default:null},
    read_status : {type:String, default:"unread"},
    os_type : {type:String, default:null},
    deletestatus :{ type:Boolean, default:false}
},{
    timestamps:true
});

const Notifications = mongoose.model('notifications', notificationSchema);
module.exports = {
    Notifications
}
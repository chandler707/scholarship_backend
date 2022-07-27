var mongoose = require("mongoose");
var schema = mongoose.Schema;

var chatDetailsSchema = new schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
      index: true,
    },
    sender_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    receiver_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message: { type: String, default: "" },
    sent_status : {type:Boolean, default:false},
    receive_status : {type:Boolean, default:false},
    read_status : {type:Boolean, default:false},
    is_opened: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var ChatDetails = mongoose.model("chat_details", chatDetailsSchema);
module.exports = {
  ChatDetails,
};

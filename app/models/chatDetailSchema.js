var mongoose = require("mongoose");
var schema = mongoose.Schema;

var chatDetailsSchema = new schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
      index: true,
    },
    message: { type: String, default: "" },
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

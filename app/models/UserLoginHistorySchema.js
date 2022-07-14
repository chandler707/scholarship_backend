var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userLoginHistorySchema = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    ip_address: { type: String, default: "user" },
    is_loggedin: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var UserLoginHistories = mongoose.model(
  "user_login_histories",
  userLoginHistorySchema
);
module.exports = {
  UserLoginHistories,
};

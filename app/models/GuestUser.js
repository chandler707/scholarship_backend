var mongoose = require("mongoose");
var schema = mongoose.Schema;

var guestSchema = new schema(
  {
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    mobile: { type: Number, default: "" },
    type: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var GuestUser = mongoose.model("guest_user", guestSchema);

module.exports = {
  GuestUser,
};

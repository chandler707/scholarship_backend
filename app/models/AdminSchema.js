var mongoose = require("mongoose");
var schema = mongoose.Schema;

var admin = new schema(
  {
    fname: { type: String, default: "" },
    lname: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var Admin = mongoose.model("admin", admin);

module.exports = {
  Admin,
};

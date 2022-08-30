var mongoose = require("mongoose");
var schema = mongoose.Schema;

var admin = new schema(
  {
    email: { type: String, default: "" },
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

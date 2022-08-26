var mongoose = require("mongoose");
var schema = mongoose.Schema;

var logoSchema = new schema(
  {
    logo_url: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var Logo = mongoose.model("logo", logoSchema);
module.exports = {
  Logo,
};

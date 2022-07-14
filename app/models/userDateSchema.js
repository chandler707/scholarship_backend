var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userDateSchema = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    date_text: { type: String, default: "" },
    dating_date: { type: Date, default: "" },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var UserDates = mongoose.model("user_dates", userDateSchema);
module.exports = {
  UserDates,
};

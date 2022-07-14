var mongoose = require("mongoose");
var schema = mongoose.Schema;

var sponcersDateUserInterestSchema = new schema(
  {
    sponcers_date_idea_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sponcers_date_ideas",
      index: true,
    },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var SponcersDateUserInterests = mongoose.model(
  "sponcers_date_user_interests",
  sponcersDateUserInterestSchema
);
module.exports = {
  SponcersDateUserInterests,
};

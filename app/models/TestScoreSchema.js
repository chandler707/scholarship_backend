var mongoose = require("mongoose");
var schema = mongoose.Schema;

var test = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    test_name: { type: String, default: "" },
    test_date: { type: Date, default: "" },

    reading_score: { type: Number, default: "" },
    lisning_score: { type: Number, default: "" },
    writing_score: { type: Number, default: "" },
    speaking_score: { type: Number, default: "" },
    overall: { type: Number, default: "" },
  },
  {
    timestamps: true,
  }
);

var TestScore = mongoose.model("test_score", test);

module.exports = {
  TestScore,
};

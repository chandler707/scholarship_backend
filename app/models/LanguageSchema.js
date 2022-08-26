var mongoose = require("mongoose");
var schema = mongoose.Schema;

var languageSchema = new schema(
  {
    language_name: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var Language = mongoose.model("languages", languageSchema);

module.exports = {
  Language,
};

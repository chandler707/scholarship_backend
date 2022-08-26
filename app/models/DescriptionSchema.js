var mongoose = require("mongoose");
var schema = mongoose.Schema;

var description = new schema(
  {
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "countries",
      index: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_category",
      index: true,
    },
    description: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var Description = mongoose.model("description", description);

module.exports = {
  Description,
};

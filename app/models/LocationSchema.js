var mongoose = require("mongoose");
var schema = mongoose.Schema;

var countrySchema = new schema(
  {
    country_name: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var stateSchema = new schema(
  {
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "countries",
      index: true,
    },
    state_name: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var Country = mongoose.model("countries", countrySchema);
var State = mongoose.model("states", stateSchema);

module.exports = {
  State,
  Country,
};

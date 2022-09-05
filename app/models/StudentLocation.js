var mongoose = require("mongoose");
var schema = mongoose.Schema;

var countrySchema = new schema(
  {
    name: { type: String, default: "" },
    isoCode: { type: String, default: "" },
    phonecode: { type: String, default: "" },

    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
var stateSchema = new schema(
  {
    name: { type: String, default: "" },
    isoCode: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var StudentCountry = mongoose.model("student_countries", countrySchema);
var StudentState = mongoose.model("student_states", stateSchema);

module.exports = {
  StudentCountry,
  StudentState,
};

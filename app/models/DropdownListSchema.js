var mongoose = require("mongoose");
var schema = mongoose.Schema;

var country_schema = new schema(
  {
    id: { type: String, default: "" },
    sortname: { type: String, default: "" },
    name: { type: String, default: "" },
    phonecode: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var state_schema = new schema(
  {
    id: { type: String, default: "" },
    name: { type: String, default: "" },
    country_id: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var city_schema = new schema(
  {
    id: { type: String, default: "" },
    name: { type: String, default: "" },
    state_id: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);
var language_schema = new schema(
  {
    name: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var Countries = mongoose.model("country", country_schema);
var States = mongoose.model("state", state_schema);
var Cities = mongoose.model("city", city_schema);
var Languages = mongoose.model("language", language_schema);

module.exports = {
  Countries,
  States,
  Cities,
  Languages,
};

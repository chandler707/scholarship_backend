var mongoose = require("mongoose");
var schema = mongoose.Schema;

var attribute = new schema(
  {
    attribute: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var attributeVal = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    attribute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attribute",
      index: true,
    },
    attribute_value: { type: String, default: "" },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var AttributeValue = mongoose.model("attribute_values", attributeVal);

var Attribute = mongoose.model("attribute", attribute);

module.exports = {
  Attribute,
  AttributeValue,
};

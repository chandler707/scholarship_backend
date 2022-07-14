const mongoose = require("mongoose");

const error = new mongoose.Schema(
  {
    is_from: { type: String, default: "NA" },
    api_name: { type: String, default: "NA" },
    function_name: { type: String, default: "NA" },
    description: { type: String, default: "NA" },
    error_title: { type: String, default: "NA" },
    mobile_data: { type: String, default: "NA" },
    status: { type: String, default: "Pending" },
    deletestatus: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Errorlogs = mongoose.model("errorlog", error);
module.exports = {
  Errorlogs,
};

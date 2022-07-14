var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userImagesSchema = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    image_name: { type: String, default: "" },
    image_order: { type: Number, default: 0 },
    is_profile_image: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var UserImages = mongoose.model("user_images", userImagesSchema);
module.exports = {
  UserImages,
};

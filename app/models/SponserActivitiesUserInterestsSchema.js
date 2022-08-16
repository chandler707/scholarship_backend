var mongoose = require("mongoose");
var schema = mongoose.Schema;

var SponserActivitiesUserInterestsSchema = new schema(
  {
    sponcer_activities_id : { type: mongoose.Schema.Types.ObjectId, ref: 'sponcer_activities', index: true },
    user_id : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },  
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

var SponserActivitiesUserInterests = mongoose.model(
  "sponcer_activities_user_interests",
  SponserActivitiesUserInterestsSchema
);
module.exports = {
  SponserActivitiesUserInterests,
};

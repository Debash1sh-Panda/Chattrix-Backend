const mongoose = require("mongoose");

const activitiesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: String,
    activityDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Activity", activitiesSchema, "user_activities");

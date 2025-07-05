const activityModel = require('../models/activity.model.js');

const logActivity = async (userId, action) => {
    await activityModel.create({
      userId,
      action,
      timestamp: new Date(),
    });
  };

module.exports = logActivity;
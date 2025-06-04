const mongoose = require('mongoose');

const DocumentLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentLevel', DocumentLevelSchema);
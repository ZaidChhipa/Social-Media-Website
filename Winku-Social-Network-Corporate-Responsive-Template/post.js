const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    message: String,
    createdBy: String,
    createdOn: Date,
  });

  module.exports = mongoose.model('Post', postSchema);
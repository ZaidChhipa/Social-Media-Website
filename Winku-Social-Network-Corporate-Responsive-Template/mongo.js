const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fname: String,
    username: String,
    password: String,
    checkboxes: [String],
    email: String,
    dateofbirth:Date,
    phonenumber : String
    
  });
  
  module.exports = mongoose.model('User', userSchema);
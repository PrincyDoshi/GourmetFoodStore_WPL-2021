// var mongoose = require('mongoose'),
// Schema = mongoose.Schema,
// passportLocalMongoose = require('passport-local-mongoose');

// var Account = new Schema({});

// Account.plugin(passportLocalMongoose);

// module.exports = mongoose.model('Account', Account);

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
    email: {
      type: String,
      unique: true
    },
    username: String,
    password: String,
    address: String,
    phone: String,
    fullName: String,
    isAdmin: String,
    created: {
      type: Date,
      default: Date.now
    },
  });

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
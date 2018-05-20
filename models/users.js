let mongoose = require('mongoose')
let Schema = mongoose.Schema

let usersSchema = new Schema({
  username: String,
  hashedPassword: String,
  email: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  homepage: {
    type: String,
    default: ''
  },
  created: {
    type: Date,
    default: Date.now()
  },
  updated: {
    type: Date,
    default: Date.now()
  }
})

usersSchema
  .virtual('userInfo')
  .get(function() {
    return {
      'username': this.username,
      'bio': this.bio,
      'email': this.email,
      'avatar': this.avatar,
      'company': this.company,
      'homepage': this.homepage,
      'github': this.github,      
      'created':this.created,
      'updated':this.updated,
      '_id': this._id
    };
  });

usersSchema.set('toObject', { virtuals: true });

const Users = module.exports = mongoose.model('Users', usersSchema)
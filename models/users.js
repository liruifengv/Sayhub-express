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
  created: {
    type: String
  },
  updated: {
    type: String
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
      'created':this.created,
      'updated':this.updated
    };
  });

usersSchema.set('toObject', { virtuals: true });

const Users = module.exports = mongoose.model('Users', usersSchema)
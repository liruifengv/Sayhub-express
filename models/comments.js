let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commentsSchema = new Schema({
  content: {
    type: String,
    default: ''
  },
  author: {
    type: String
  },
  articleID: {
    type: String
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

const Comments = module.exports = mongoose.model('Comments', commentsSchema)
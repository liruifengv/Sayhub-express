let mongoose = require('mongoose')
let Schema = mongoose.Schema

let draftsSchema = new Schema({
  title: String,
  content: {
    type: String,
    default: ''
  },
  content_render: {
    type: String,
    default: ''
  },
  content_text: {
    type: String,
    default: ''
  },
  author: {
    type: String
  },
  category: {
    type: Array
  },
  created: {
    type: String
  },
  updated: {
    type: String
  }
})

const Drafts = module.exports = mongoose.model('Drafts', draftsSchema)
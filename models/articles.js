let mongoose = require('mongoose')
let Schema = mongoose.Schema

let articlesSchema = new Schema({
  title: String,
  abstract: {
    type: String,
    default: ''
  },
  content: {
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
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
})

const Articles = module.exports = mongoose.model('Articles', articlesSchema)
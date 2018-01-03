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
    type: String
  },
  updated: {
    type: String
  }
})

const Articles = module.exports = mongoose.model('Articles', articlesSchema)
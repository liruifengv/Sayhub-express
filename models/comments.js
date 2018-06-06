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
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  is_up: {             // 是否点赞
    type: Boolean,
    default: false
  },
  votes_count: {             // 点赞数量
    type: Number,
    default: 0
  },
  votes: {                  // 点赞人数组(里面包含点赞人的 id)
    type: Array
  }
})

const Comments = module.exports = mongoose.model('Comments', commentsSchema)
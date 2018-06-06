let mongoose = require('mongoose')
let Schema = mongoose.Schema

let articlesSchema = new Schema({
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
  },
  comments_count: {          // 评论数量
    type: Number,
    default: 0
  },
  comments: {          // 评论数组(里面包含评论的 id)
    type: Array
  },
  readed_count: {          // 阅读数量
    type: Number,
    default: 0
  },
  readedUsers: {          // 评论数组(里面包含评论的 id)
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
let express = require('express')
let router = express.Router()
let Articles = require('../models/articles')
let Comments = require('../models/comments')

// 获取某一篇文章的评论
router.get('/article/:id/comments', function (req, res, next) {
  let articleID = req.params.id
  let page_size = Number(req.query.page_size)
  let page = Number(req.query.page)

  const commentsQuery = Comments.find({articleID,articleID})

  // 查询评论总数
  commentsQuery.count({}, function(err, count) {
    if (err) return handleError(err)
    console.log('评论总数为：', count )
    let total = count
   
  // 分页
  Comments.find({ articleID, articleID })
    .limit(page_size)
    .skip((page - 1) * page_size)
    .exec()
    .then(function (comments) {
      return res.status(200).json({ total, comments })
    }).catch(function (err) {
      return res.status(400).send()
    })

  })
})

// 删除评论
router.delete('/comment/:id', function(req, res, next) {
  let _id = req.params.id
  Comments.remove({_id:_id})
    .then(() => {
      return res.sendStatus(200)
  }).catch(function (err) {
      return res.status(401).send()
  })
})

// 发表评论
router.post('/article/:id/comment', function(req, res, next) {
  let articleID = req.params.id
  let newComment = {
    articleID: req.params.id,
    content: req.body.content,
    author: req.body.author
  }

  Comments.create(newComment)
    .then((newArticleInfo) => {
      Articles.findByIdAndUpdate(articleID,{
        '$addToSet':{'comments':newArticleInfo._id},
        '$inc':{'comments_count':1},
        is_up: true
      },{new:true}).then((ArticleInfo) => {
        res.status(200).json({comments_count: ArticleInfo.comments_count})
      })
      // return res.sendStatus(200)      
    }).catch(function (err) {
      return res.status(401).send()
    })
})

module.exports = router;

let express = require('express')
let router = express.Router()
let Articles = require('../models/articles')
let Comments = require('../models/comments')
var jwt = require('jsonwebtoken');  // token

// 获取某一篇文章的评论
router.get('/article/:id/comments', function (req, res, next) {
  let articleID = req.params.id
  let page_size = Number(req.query.page_size)
  let page = Number(req.query.page)
  let sayhub_token = req.headers.authorization.slice(7)
  
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


// 点赞
router.post(`/comment/:id/up` , function(req, res, next) {

  let commentId = req.params.id
  let sayhub_token = req.headers.authorization.slice(7)
  
  if (sayhub_token) {
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    const username = decoded.username
    const userID = decoded.userID
    Comments.findByIdAndUpdate(commentId,{
      '$addToSet':{'votes':userID},
      '$inc':{'votes_count':1},
      is_up: true
    },{new:true}).then((Comment) => {
      res.status(200).json({votes_count: Comment.votes_count})
    })
  } else {
    return res.sendStatus(401)
  }
})
// 取消赞
router.delete(`/comment/:id/up` , function(req, res, next) {

  let commentId = req.params.id
  
  let sayhub_token = req.headers.authorization.slice(7)
  
  if (sayhub_token) {
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    const username = decoded.username
    const userID = decoded.userID

    Comments.findByIdAndUpdate(commentId,{
      '$pull':{'votes':userID},
      '$inc':{'votes_count':-1},
      is_up: false
    },{new:true}).then((Comment) => {
      res.status(200).json({votes_count: Comment.votes_count})
    })
  } else {
    return res.sendStatus(401)
  }
})

module.exports = router;

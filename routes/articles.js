let express = require('express')
let router = express.Router()
var jwt = require('jsonwebtoken');  // token
let Articles = require('../models/articles')
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
})

router.get('/articles', function (req, res, next) {
  let category = req.query.category
  let page_size = Number(req.query.page_size)
  let page = Number(req.query.page)
  // console.log(req.query)
  if (category) {

    const articlesQuery = Articles.find({category,category})

     // 查询文章总数
    articlesQuery.count({}, function(err, count) {
      if (err) return handleError(err)
      console.log('文章总数为：', count )
      let total = count
      
      // 分页
      Articles.find({category,category})
        .limit(page_size)
        .skip((page-1)*page_size)
        .exec()
        .then(function(articles) {
          return res.status(200).json({total,articles})
        }).catch(function (err) {
          return res.status(400).send()
        })
    })
  } else {

    const articlesQuery = Articles.find({})

     // 查询文章总数
    articlesQuery.count({}, function(err, count) {
      if (err) return handleError(err)
      console.log('文章总数为：', count )
      let total = count

      // 分页
      Articles.find({})
        .limit(page_size)
        .skip((page-1)*page_size)
        .exec()
        .then(function(articles) {
          return res.status(200).json({total,articles})
        }).catch(function (err) {
          return res.status(400).send()
        })
    })
  }
})

router.post('/articles', function (req, res, next) {
  // console.log(req.body)
  const reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g
  const content_render = md.render(req.body.content);
  const content_text = req.body.content.replace(reg, "")
  let newArticle = {
    title: req.body.title,
    content: req.body.content,
    content_render: content_render,
    content_text: content_text, 
    author: req.body.author,
    category: req.body.category,
    created: new Date().toLocaleString(),
    updated: new Date().toLocaleString()
  }
  Articles.create(newArticle)
    .then((newArticleInfo) => {
      return res.status(200).json({id: newArticleInfo._id})
    })
})

router.get('/article/:id', function(req, res, next) {
  let _id = req.params.id

  if (req.headers.authorization) {
    console.log('已登录')
    let sayhub_token = req.headers.authorization.slice(7)
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    // const username = decoded.username
    const userID = decoded.userID
    Articles.findById(_id)
      .then((info) => {
        let _votes = info.votes
        if (_votes.includes(userID)) {
          Articles.findByIdAndUpdate(_id, {
            is_up: true
          },{new: true})
          .then((ArticleDetail) => {
            // console.log(ArticleDetail)
            res.json(ArticleDetail)
          }).catch(function (err) {
            return res.status(401).send()
          })
        } else {
          Articles.findByIdAndUpdate(_id, {
            is_up: false
          },{new: true})
          .then((ArticleDetail) => {
            // console.log(ArticleDetail)
            res.json(ArticleDetail)
          }).catch(function (err) {
            return res.status(401).send()
          })
        }
      })
  } else {
    console.log('未登录')
    Articles.findByIdAndUpdate(_id, {
      is_up: false
    },{new: true})
    .then((ArticleDetail) => {
      // console.log(ArticleDetail)
      res.json(ArticleDetail)
    }).catch(function (err) {
      return res.status(401).send()
    })
  }
})

router.delete('/article/:id', function(req, res, next) {
  let _id = req.params.id
  console.log(req.params)
  Articles.remove({_id:_id})
    .then(() => {
      return res.sendStatus(200)
  }).catch(function (err) {
      return res.status(401).send()
  })
})

router.put('/article/:id', function (req, res, next) {
  let _id = req.params.id
  // console.log(req.body)
  const reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g
  const content_render = md.render(req.body.content);
  const content_text = req.body.content.replace(reg, "")
  let editArticle = {
    title: req.body.title,
    content: req.body.content,
    content_render: content_render,
    content_text: content_text, 
    author: req.body.author,
    category: req.body.category,
    updated: new Date().toLocaleString()
  }
  Articles.findByIdAndUpdate(_id, editArticle, {new:true})
    .then((ArticleInfo) => {
      return res.status(200).json({id: ArticleInfo._id})
    })
})

router.post(`/article/:id/up` , function(req, res, next) {

  let articleId = req.params.id
  
  let sayhub_token = req.headers.authorization.slice(7)
  // console.log(sayhub_token)
  
  if (sayhub_token) {
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    const username = decoded.username
    const userID = decoded.userID

    Articles.findByIdAndUpdate(articleId,{
      '$addToSet':{'votes':userID},
      '$inc':{'votes_count':1},
      is_up: true
    },{new:true}).then((ArticleInfo) => {
      res.status(200).json({votes_count: ArticleInfo.votes_count})
    })
  } else {
    return res.sendStatus(401)
  }
})

router.delete(`/article/:id/up` , function(req, res, next) {

  let articleId = req.params.id
  
  let sayhub_token = req.headers.authorization.slice(7)
  // console.log(sayhub_token)   
  
  if (sayhub_token) {
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    const username = decoded.username
    const userID = decoded.userID

    Articles.findByIdAndUpdate(articleId,{
      'pull':{'votes':userID},
      '$inc':{'votes_count':-1},
      is_up: false
    },{new:true}).then((ArticleInfo) => {
      res.status(200).json({votes_count: ArticleInfo.votes_count})
    })
  } else {
    return res.sendStatus(401)
  }
})

module.exports = router;

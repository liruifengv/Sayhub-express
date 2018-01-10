let express = require('express')
let router = express.Router()
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
    abstract: req.body.abstract,
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
  // console.log(req.params)
  Articles.findById({_id: _id})
  .then((ArticleDetail) => {
    // console.log(ArticleDetail)
    res.json(ArticleDetail)
  }).catch(function (err) {
    return res.status(401).send()
  })
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

module.exports = router;

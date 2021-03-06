let express = require('express')
let router = express.Router()
var jwt = require('jsonwebtoken');  // token
let Articles = require('../models/articles')
let Drafts = require('../models/drafts')
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
})
function format (data,id) {
  formatData = data.map((item) => {
    if (item.votes.includes(id)) {
      item.is_up = true
    } else {
      item.is_up = false
    }
    return item
  }) || []
  return formatData   
}
// 文章列表
router.get('/articles', function (req, res, next) {
  let category = req.query.category   // 标签分类
  let title = req.query.title         // 搜索文章  目前只支持 title
  let page_size = Number(req.query.page_size)
  let page = Number(req.query.page)
  let sort = req.query.sort 
  let userID = ''
  if (req.headers.authorization) {
    let sayhub_token = req.headers.authorization.slice(7)
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    userID = decoded.userID
  }
  let formatData = []
  // 通过query参数判断
  if (title) {
    console.log(title)
    Articles.find({title: new RegExp(title)})
      .then((articles) => {
        return res.status(200).json({articles})
      })
      .catch((err) => {
        return res.status(400).send()
      })
  } else if (category) {

    const articlesQuery = Articles.find({category,category})

     // 查询文章总数
    articlesQuery.count({}, function(err, count) {
      if (err) return handleError(err)
      console.log('文章总数为：', count )
      let total = count
      
      // 分页
      Articles.find({category,category})
        .sort({created: -1})
        .limit(page_size)
        .skip((page-1)*page_size)
        .exec()
        .then(function(articles) {
          formatData = format(articles,userID)
          return res.status(200).json({total,next,formatData})
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
      let next = page + 1
      if (sort === 'hot') {
            // 分页
            Articles.find({})
            .sort({readed_count: -1})
            .limit(page_size)
            .skip((page-1)*page_size)
            .exec()
            .then(function(articles) {
              formatData = format(articles,userID)
              return res.status(200).json({total,next,formatData})
            }).catch(function (err) {
              return res.status(400).send()
            })
      } else {
                    // 分页
            Articles.find({})
            .sort({created: -1})
            .limit(page_size)
            .skip((page-1)*page_size)
            .exec()
            .then(function(articles) {
              formatData = format(articles,userID)
              return res.status(200).json({total,next,formatData})
            }).catch(function (err) {
              return res.status(400).send()
            })
      }

    })
  }
})
// 发表文章
router.post('/articles', function (req, res, next) {
  const reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g
  const content_render = md.render(req.body.content);
  const content_text = req.body.content.replace(reg, "")
  let newArticle = {
    title: req.body.title,
    content: req.body.content,
    content_render: content_render,
    content_text: content_text, 
    author: req.body.author,
    category: req.body.category
  }
  Articles.create(newArticle)
    .then((newArticleInfo) => {
      res.status(200).json({id: newArticleInfo._id})
      if (req.body.draftId) {
        Drafts.remove({
          _id: req.body.draftId
        })
        .then(() => {
          return res.sendStatus(200)
        }).catch(function (err) {
          return res.status(401).send()
        })
      }
    })
})
// 文章详情
router.get('/article/:id', function(req, res, next) {
  let _id = req.params.id

  // 判断是否登录
  if (req.headers.authorization) {
    let sayhub_token = req.headers.authorization.slice(7)
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    // const username = decoded.username
    const userID = decoded.userID
    Articles.findById(_id)
      .then((info) => {
        let _readedUsers = info.readedUsers
        // 判断已读用户里有没有当前用户 如果有证明已阅读过
        if (_readedUsers.includes(userID)) {
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
        } else { // 已读用户里没有当前用户 阅读量+1
          let _votes = info.votes
          if (_votes.includes(userID)) {
            Articles.findByIdAndUpdate(_id, {
              is_up: true,
              '$addToSet':{'readedUsers':userID},
              '$inc':{'readed_count':1}
            },{new: true})
            .then((ArticleDetail) => {
              // console.log(ArticleDetail)
              res.json(ArticleDetail)
            }).catch(function (err) {
              return res.status(401).send()
            })
          } else {
            Articles.findByIdAndUpdate(_id, {
              is_up: false,
              '$addToSet':{'readedUsers':userID},
              '$inc':{'readed_count':1}
            },{new: true})
            .then((ArticleDetail) => {
              // console.log(ArticleDetail)
              res.json(ArticleDetail)
            }).catch(function (err) {
              return res.status(401).send()
            })
          }
        }
      })
  } else { // 没有登录，阅读量直接+1
    Articles.findByIdAndUpdate(_id, {
      is_up: false,
      '$inc':{'readed_count':1},
    },{new: true})
    .then((ArticleDetail) => {
      // console.log(ArticleDetail)
      res.json(ArticleDetail)
    }).catch(function (err) {
      return res.status(401).send()
    })
  }
})
// 删除文章
router.delete('/article/:id', function(req, res, next) {
  let _id = req.params.id
  Articles.remove({_id:_id})
    .then(() => {
      return res.sendStatus(200)
  }).catch(function (err) {
      return res.status(401).send()
  })
})
// 更新文章
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
    category: req.body.category
  }
  Articles.findByIdAndUpdate(_id, editArticle, {new:true})
    .then((ArticleInfo) => {
      return res.status(200).json({id: ArticleInfo._id})
    })
})
// 点赞
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
// 取消赞
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
      '$pull':{'votes':userID},
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

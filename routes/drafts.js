let express = require('express')
let router = express.Router()
var jwt = require('jsonwebtoken'); // token
let Drafts = require('../models/drafts')
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
})

router.get('/drafts', function (req, res, next) {
  let page_size = Number(req.query.page_size)
  let page = Number(req.query.page)
  // console.log(req.query)
  if (req.headers.authorization) {
    console.log('已登录')
    let sayhub_token = req.headers.authorization.slice(7)
    const decoded = jwt.verify(sayhub_token, 'sayhub');

    const username = decoded.username

    const draftsQuery = Drafts.find({
      author: username
    })

    // 查询文章总数
    draftsQuery.count({}, function (err, count) {
      if (err) return handleError(err)
      console.log('草稿总数为：', count)
      let total = count

      // 分页
      Drafts.find({author: username})
        .sort({created: -1})
        .limit(page_size)
        .skip((page - 1) * page_size)
        .exec()
        .then(function (drafts) {
          return res.status(200).json({
            total,
            drafts
          })
        }).catch(function (err) {
          return res.status(400).send()
        })
    })
  } else {
    console.log('未登录')
    return res.status(401).send({
      'content': '未登录'
    });
  }
})

router.post('/drafts', function (req, res, next) {
  // console.log(req.body)
  const reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g
  const content_render = md.render(req.body.content);
  const content_text = req.body.content.replace(reg, "")
  let newDraft = {
    title: req.body.title,
    content: req.body.content,
    content_render: content_render,
    content_text: content_text,
    author: req.body.author,
    category: req.body.category
  }
  Drafts.create(newDraft)
    .then((newDraftInfo) => {
      return res.status(200).json({
        id: newDraftInfo._id
      })
    })
})

router.delete('/draft/:id', function (req, res, next) {
  let _id = req.params.id
  // console.log(req.params)
  Drafts.remove({
      _id: _id
    })
    .then(() => {
      return res.sendStatus(200)
    }).catch(function (err) {
      return res.status(401).send()
    })
})

router.put('/draft/:id', function (req, res, next) {
  let _id = req.params.id
  // console.log(req.body)
  const reg = /[\\\`\*\_\[\]\#\+\-\!\>]/g
  const content_render = md.render(req.body.content);
  const content_text = req.body.content.replace(reg, "")
  let editDraft = {
    title: req.body.title,
    content: req.body.content,
    content_render: content_render,
    content_text: content_text,
    author: req.body.author
  }
  Drafts.findByIdAndUpdate(_id, editDraft, {
      new: true
    })
    .then((DraftInfo) => {
      return res.status(200).json({
        id: DraftInfo._id
      })
    })
})

router.get('/draft/:id', function (req, res, next) {
  let _id = req.params.id

  if (req.headers.authorization) {
    console.log('已登录')
    let sayhub_token = req.headers.authorization.slice(7)
    const decoded = jwt.verify(sayhub_token, 'sayhub');
    // 从token中拿到用户名和userID
    // const username = decoded.username
    const userID = decoded.userID
    Drafts.findById(_id)
      .then((draft) => {
        // console.log(ArticleDetail)
        res.json(draft)
      }).catch(function (err) {
        return res.status(401).send()
      })
  } else {
    console.log('未登录')
    return res.status(401).send()
  }
})

module.exports = router;
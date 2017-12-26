let express = require('express')
let router = express.Router()
let Articles = require('../models/articles')

router.get('/articles', function (req, res, next) {
  Articles.find({}).then(function (article) {
    return res.status(200).json(article);
  }).catch(function (err) {
    return res.status(400).send();
  });
})

router.post('/articles', function (req, res, next) {
  console.log(req.body)
  let newArticle = {
    title: req.body.title,
    abstract: req.body.abstract,
    content: req.body.content,
    author: req.body.author
  }
  Articles.create(newArticle)
    .then((newArticleInfo) => {
      res.sendStatus(200)
    })
})

module.exports = router;

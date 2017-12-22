var express = require('express');
var router = express.Router();
let crypto = require('crypto')  // 加墨
var jwt = require('jsonwebtoken');  // token
var expressJwt = require('express-jwt'); // express token
let Users = require('../models/users')

// 获取 userInfo
router.get('/users/:id', function(req, res, next) {
  let userId = req.params.id
  Users.findById(userId).then(function (user) {
		return res.status(200).json(user.userInfo);
	}).catch(function (err) {
		return res.status(401).send();
	});
})

// 用户注册
router.post('/users', function(req, res ,next) {
  let username = req.body.username
  let password = req.body.password
  // console.log(req.body.username)
  // 加密
  let md5 = crypto.createHash('md5')
  let hashedPassword = md5.update(password).digest('hex')

  let newUser = {
    username: username,
    hashedPassword: hashedPassword
  }
  
  Users.findOne({username: username})
    .then((userInfo) => {
      if (userInfo) {
        res.status(400).send({'content':'用户已存在'});
      } else {
        Users.create(newUser)
          .then((newUserInfo) => {
            res.sendStatus(200)
          })
      }
    })
})


module.exports = router;

var express = require('express');
var router = express.Router();
let crypto = require('crypto')  // 加墨
var jwt = require('jsonwebtoken');  // token
var expressJwt = require('express-jwt'); // express token
let Users = require('../models/users')
  
  // 用户注册
  router.post('/users', function(req, res ,next) {

    let username = req.body.username
    let password = req.body.password

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

  // 用户登录
  router.post('/login', function (req, res, next) {

    let username = req.body.username
    let password = req.body.password

    Users.findOne({username: username})
    .then((userInfo) => {
      if (userInfo) {
        // 加密
        let md5 = crypto.createHash('md5')
        let hashedPassword = md5.update(password).digest('hex')
        // 判断密码正确
        if (hashedPassword === userInfo.hashedPassword) {
          let sayhub_token = jwt.sign({ username: username, userID: userInfo.id }, 'sayhub')
          return res.status(200).send({'sayhub_token': sayhub_token});
        } else {
          res.status(400).send({'content':'密码错误'});
        }
      } else {
        res.status(400).send({'content':'用户不存在'});
      }
    })
  })

  // 获取 userInfo
  router.get('/users/:username', function(req, res, next) {
    let username = req.params.username
    Users.findOne({username: username}).then(function (user) {
      return res.status(200).json(user.userInfo);
    }).catch(function (err) {
      return res.status(401).send();
    });
  })

  // 获取登陆用户 Profile
  router.get('/profile', function(req, res, next) {
    // console.log(req.headers.authorization)
    let sayhub_token = req.headers.authorization.slice(7)
    // console.log(sayhub_token)
    if (sayhub_token) {
      const decoded = jwt.verify(sayhub_token, 'sayhub');
      // 从token中拿到用户名和userID
      const username = decoded.username
      const userID = decoded.userID
      Users.findById(userID).then(function (user) {
        return res.status(200).json(user.userInfo);
      }).catch(function (err) {
        return res.status(401).send();
      });
    } else {
      return res.status(401).send();
    }
  })

// 更新个人资料
router.put('/profile', function(req, res, next) {
      // console.log(req.headers.authorization)
    let sayhub_token = req.headers.authorization.slice(7)
     // console.log(sayhub_token)
    if (sayhub_token) {
      const decoded = jwt.verify(sayhub_token, 'sayhub');
        // 从token中拿到用户名和userID
      const username = decoded.username
      const userID = decoded.userID
      const newProfile = {
        bio: req.body.bio,
        email: req.body.email
      }
      Users.findByIdAndUpdate(userID, newProfile, {new: true})
        .then(function (user) {
          return res.status(200).json(user.userInfo);
        }).catch(function (err) {
          return res.status(401).send();
        });
      } else {
        return res.status(401).send();
      }
})
router.patch('/avatar', function(req, res, next) {
  let sayhub_token = req.headers.authorization.slice(7)
  if (sayhub_token) {
    const decoded = jwt.verify(sayhub_token, 'sayhub');
      // 从token中拿到用户名和userID
    const username = decoded.username
    const userID = decoded.userID
    
  }
})
module.exports = router;

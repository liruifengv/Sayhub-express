var express = require('express');
var router = express.Router();
let crypto = require('crypto')  // 加墨
var jwt = require('jsonwebtoken');  // token
var expressJwt = require('express-jwt'); // express token
let Users = require('../models/users')
let Articles = require('../models/articles')
let formatData = ""
  
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
              res.sendStatus(200).send({'content':'注册成功'});
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
    // 获取 user 发表过的文章
  router.get('/users/:username/articles', function(req, res, next) {
    let username = req.params.username
    let userID = ''
    if (req.headers.authorization) {
      let sayhub_token = req.headers.authorization.slice(7)
      const decoded = jwt.verify(sayhub_token, 'sayhub');
      // 从token中拿到用户名和userID
      userID = decoded.userID
    }
    Articles.find({author: username}).then(function (articles) {
      formatData = format(articles,userID)
      return res.status(200).json({formatData})
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
router.post('/profile', function(req, res, next) {
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
        email: req.body.email,
        company: req.body.company,
        github: req.body.github,
        homepage: req.body.homepage  
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
  // 用户修改密码
  router.post('/users/password/change', function (req, res, next) {

    let oldPassword = req.body.oldPassword
    let newPassword = req.body.newPassword
    console.log(oldPassword)
    let sayhub_token = req.headers.authorization.slice(7)
    // console.log(sayhub_token)
   if (sayhub_token) {
     const decoded = jwt.verify(sayhub_token, 'sayhub');
       // 从token中拿到用户名和userID
     const username = decoded.username
     const userID = decoded.userID
     Users.findOne({username: username})
      .then((userInfo) => {
        console.log(userInfo)
        if (userInfo) {
         // 加密
          let md5 = crypto.createHash('md5')
          let hashedPassword = md5.update(oldPassword).digest('hex')
        //  let newHashedPassword = md5.update(newPassword).digest('hex')
         // 判断密码正确
          if (hashedPassword === userInfo.hashedPassword) {
            console.log('旧密码正确')
            let md5 = crypto.createHash('md5')
            let newHashedPassword = md5.update(newPassword).digest('hex')
            Users.findByIdAndUpdate(userID,{
              hashedPassword: newHashedPassword
            },{new:true}).then((userInfo) => {
              console.log('222')              
              res.status(200).json({'content':'修改密码成功'})
            })
          } else {
            res.status(400).send({'content':'旧密码错误'});
          }
      }
     })
    }
  })
module.exports = router;

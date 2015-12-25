var models  = require('../models');
var passwordHash = require('password-hash');
fs = require("fs");

exports.index = function(req, res){
    res.render('index', {title:"重庆维普日志平台", request : req});
};
exports.dologin = function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var mailreg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!mailreg.test(username) || !password){
        res.json({err:4});
        return;
    }
    models.User.find({where : {username: username}})
                .then(function(user){
                     if(user == null){
                         res.json({err:1}); //用户名不存在
                     }
                    else if(passwordHash.verify(password, user.password)){
                         req.session.username = user.username;
                         req.session.avatar = user.avatar;
                         res.json({err:0}); //成功登陆
                    }
                    else{
                         res.json({err:2}); //密码错误
                     }
                })
                .catch(function(err){
                    res.json({err:3}); //数据库错误
                });
};

exports.register = function(req, res){
    res.render('register', { title: '注册新用户-重庆维普日志平台', request : req});
};

exports.doregister = function(req, res){
    var mailreg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!mailreg.test(req.body.username) || req.body.password == null || !req.body.nickname == null){
        res.json({err:3});
        return;
    }
    var username = req.body.username;
    var nickname = req.body.nickname;
    var password = passwordHash.generate(req.body.password);
    var avatar = req.files["..."] ? req.files["..."].name : "";
    var buffer = req.files["..."] ? req.files["..."].buffer : null;
    models.User.find({where : { username: username}})
        .then(function(user){
             if(user == null){
                 if(buffer != null){
                     fs.writeFile("./public/images/avatar/" + avatar, buffer);
                 }
                models.User.create({username: username, password: password, nickname: nickname, avatar: avatar})
                            .then(function() {
                                  res.json({err:0}); //成功注册
                            });
            }
            else{
                 res.json({err:1}); //已存在用户
             }
        })
        .catch(function(err){
            res.json({err:2}); //数据库错误
        });
};

exports.logout = function(req, res){
    req.session.destroy();
    res.redirect("/");
};
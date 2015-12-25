var models  = require('../models');
var passwordHash = require('password-hash');
var soap = require('soap');
var moment = require('moment');
var config = require("../config/config.json");

exports.index = function(req, res){
	models.Recommend.count().then(function(count){
		res.render('recommend/index', {title: '个性化推荐-重庆维普日志平台', request : req, ucount: count});
	});
};


exports.sample = function(req, res){
	var n = parseInt(req.query.n);
	models.Recommend.findAll({order: 'rand()', limit: n}).then(function(data){	
		res.render('recommend/sample', {title: '个性化推荐-重庆维普日志平台', request : req, n: n, users: data, offset: 0});
	});
};

exports.user_table = function(req, res){
    var m = req.body.m;
    var page = 10
    if(m == "user"){
   	 if(typeof req.body.p == "undefined"){
		req.body.p = 0
   	 }
   	 models.Recommend.findAll({limit: page, offset: page * req.body.p})
       		 .then(function(data){
       		 	res.render('recommend/user_table', {users: data, offset: page * req.body.p});
       	 });
    }
    else if(m == 'count'){
    	 models.History.count().then(function(count){
            count = count % page == 0 ? count / page : count / page + 1;
            res.json(count);
         });
    }
};


exports.u = function(req, res){
    var uid = req.query.uid
    res.render('recommend/u', {title: '个性化推荐-重庆维普日志平台', request : req, uid: uid});
};

exports.history = function(req, res){
    var uid = req.body.uid
    var p = req.body.p
    var m = req.body.m;
    var page = 20
    if(m == "history"){
	models.History.find({where: {uid: uid}}).then(function(history){
		history = JSON.parse(history.history); 
		history = history.slice(p * page, p* page + page)
		ids = []
		for(var i in history){
			ids.push(history[i].id)
		}
		url = config.development.di;
		soap.createClient(url, function(err, client) {
			args = {
				fieldName: '_id',
				fieldValues: ids.join(";"),
				objectName: 'title_info',
				resultFields: "title_c",
				flag: 0
			};
			client.vipGetInfoById(args, function(err, result) {	
				result = JSON.parse(result.out).results;
				for(var i in history){
					for(var j in result){
						if(history[i].id == result[j]._id){
							history[i].title = result[j].title_c;
							break;
						}
					}
				}
				res.render('recommend/history', {history: history, offset: page * p});
			});
		});
  	});
    }
    else if(m == "count"){
	models.History.find({where: {uid: uid}}).then(function(history){
		if(history != null){
			history = JSON.parse(history.history);	
            		count = history.length;
			count = count % page == 0 ? count / page : count / page + 1;
			res.json(count)
		}
  	});	
    }
};


exports.rlist = function(req, res){
    var uid = req.body.uid
    var p = req.body.p
    var m = req.body.m;
    var page = 20
    if(m == "rlist"){
	models.Recommend.find({where: {uid: uid}}).then(function(recs){
		recs = JSON.parse(recs.recommend); 
		recs = recs.slice(p * page, p* page + page)
		ids = []
                for(var i in recs){
                        ids.push(recs[i].id)
                }
                url = config.development.di;
                soap.createClient(url, function(err, client) {
                        args = {
                                fieldName: '_id',
                                fieldValues: ids.join(";"),
                                objectName: 'title_info',
                                resultFields: "title_c",
                                flag: 0
                        };
                        client.vipGetInfoById(args, function(err, result) {
                                result = JSON.parse(result.out).results;
                                for(var i in recs){
                                        for(var j in result){
                                                if(recs[i].id == result[j]._id){
                                                        recs[i].title = result[j].title_c;
                                                        break;
                                                }
                                        }
                                }
				res.render('recommend/rlist', {uid: uid, rlist: recs, offset: page * p});
                        });
                });
  	});
    }
    else if(m == "count"){
	models.Recommend.find({where: {uid: uid}}).then(function(recs){
		if(recs != null){
			recs = JSON.parse(recs.recommend); 
            		count = recs.length;
			count = count % page == 0 ? count / page : count / page + 1;
			res.json(count)
		}
  	});	
    }
};

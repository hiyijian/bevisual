var models  = require('../models');
var passwordHash = require('password-hash');
var moment = require('moment');
var config = require("../config/config.json");
var soap = require('soap');

exports.index = function(req, res){
	uid = req.query.uid
	docid = req.query.docid
	s = req.query.s
	url = config.development.di;
        soap.createClient(url, function(err, client) {
		args = {
			fieldName: '_id',
			fieldValues: docid,
			objectName: 'title_info',
			resultFields: "title_c",
			flag: 0
		};
		client.vipGetInfoById(args, function(err, result) {
			result = JSON.parse(result.out).results;
			doc_title = result[0].title_c
			res.render('compare/index', {title: '个性化推荐-主题对比', request : req, uid: uid, docid: docid, doc_title: doc_title, s: s});
		});
	});
};

exports.user_topic = function(req, res){
    var uid = "_*" + req.body.uid
    models.UserTopic.find({where: {uid: uid}}).then(function(recs){
	topics = JSON.parse(recs.topics);
	res.json(topics)
    });
};

exports.doc_topic = function(req, res){
    var doc_id = "_*" + req.body.docid;
    models.DocTopic.find({where: {doc_id: doc_id}}).then(function(recs){
        Topics = JSON.parse(recs.Topics);
	res.json(Topics)
   });
};

exports.doc_user_common = function(req,res){
    var doc_id = "_*" + req.body.docid;
    var uid = "_*" + req.body.uid;
    models.UserTopic.find({where: {uid: uid}}).then(function(user){
        user_topics = JSON.parse(user.topics);
	user_otherp2 = user_topics.otherp2;
	user_topics = user_topics.main;
        models.DocTopic.find({where: {doc_id: doc_id}}).then(function(doc){
        doc_topics = JSON.parse(doc.Topics);
	doc_otherp2 = doc_topics.otherp2;
	doc_topics = doc_topics.main;

        user_topic_serials=[];
        user_topic_rates=[];
        for(var i in user_topics){
            user_topic_serials.push(user_topics[i].serial);
            user_topic_rates.push(user_topics[i].rate);
        };

        doc_topic_serials=[];
        doc_topic_rates=[];
        for (var i in doc_topics) {
            doc_topic_serials.push(doc_topics[i].serial);
            doc_topic_rates.push(doc_topics[i].rate);
        };


        //把user_rates标准化(L2)
        var len_user_pow=user_otherp2;
        for (var i in user_topic_rates) {
            len_user_pow+=Math.pow(user_topic_rates[i],2);
        }
        var len_user=Math.sqrt(len_user_pow);

        for(var i in user_topic_rates){
            user_topic_rates[i]/=len_user;
        }
        //标准化doc_rate向量(L2)
        var len_doc_pow=doc_otherp2;
        for(var i in doc_topic_rates){
            len_doc_pow+=Math.pow(doc_topic_rates[i],2);
        }
        var len_doc=Math.sqrt(len_doc_pow);

        for (var i = doc_topic_rates.length - 1; i >= 0; i--) {
            doc_topic_rates[i]/=len_doc;
        }

        //记录相同topic_serial位置
        user_topics_ids=[]
        doc_topics_ids=[]
        for (var i = user_topic_serials.length - 1; i >= 0; i--) {
            for (var j = doc_topic_serials.length - 1; j >= 0; j--) {
                //数据按rate排序，所以只能遍历
                if(doc_topic_serials[j]==user_topic_serials[i]){
                    user_topics_ids.push(i);
                    doc_topics_ids.push(j);
                }
            }
        }

        //获取共同的topic编号
        common_topic=[];
        //获取user的common topic的权重
        user_rate_common_topic=[];
        for (var i = user_topics_ids.length - 1; i >= 0; i--) {
            common_topic.push(user_topic_serials[user_topics_ids[i]]);
            user_rate_common_topic.push(user_topic_rates[user_topics_ids[i]]);
        }
        //获取doc的common topic的权重
        doc_rate_common_topic=[];
        for (var i = doc_topics_ids.length - 1; i >= 0; i--) {
            doc_rate_common_topic.push(doc_topic_rates[doc_topics_ids[i]]);  
        }
        res.json({topic: common_topic, user_rate: user_rate_common_topic, doc_rate: doc_rate_common_topic});
    });
});
};


exports.word_cloud = function(req, res){
    var tid = parseInt(req.body.tid);
    models.ModelView.find({where: {Topic: tid}}).then(function(data){
	words = JSON.parse(data.Context);
	res.json(words)
    });
};

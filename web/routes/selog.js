var models  = require('../models');
var passwordHash = require('password-hash');
var soap = require('soap');
var moment = require('moment');

exports.index = function(req, res){
    models.SEStat.findAll({order: 'time DESC', limit: 2})
        .then(function(data){
            if(data.length == 0){
                res.render('selog/index', {title: '检索/点击-重庆维普日志平台', request : req});
            }
            recent = data[0];
            recentq = {
                search : recent.search,
                ctr : 100.0 * recent.search_with_click / recent.search,
                click : 1.0 * recent.click / recent.search,
                ctp : 1.0 * recent.first_ctp_sum / recent.search_with_click,
                ctt : 1.0 * recent.first_ctt_sum / recent.search_with_click,
                nullr : 100.0 * recent.null_search / recent.search,
                pager : 100.0 * recent.pagenation / recent.search,
                page : 1.0 * recent.pagenation_sum / recent.search,
                time  : recent.time
            };
            if(data.length == 2){
                near = data[1];
                nearq = {
                    search : near.search,
                    ctr : 100.0 * near.search_with_click / near.search,
                    click : 1.0 * near.click / near.search,
                    ctp : 1.0 * near.first_ctp_sum / near.search_with_click,
                    ctt : 1.0 * near.first_ctt_sum / near.search_with_click,
                    nullr : 100.0 * near.null_search / near.search,
                    pager : 100.0 * near.pagenation / near.search,
                    page : 1.0 * near.pagenation_sum / near.search
                };
                rate = {
                    search : 100 * (recentq.search - nearq.search) / nearq.search,
                    ctr : 100 * (recentq.ctr - nearq.ctr) / nearq.ctr,
                    click : 100 * (recentq.click - nearq.click) / nearq.click,
                    ctp : 100 * (recentq.ctp - nearq.ctp) / nearq.ctp,
                    ctt : 100 * (recentq.ctt - nearq.ctt) / nearq.ctt,
                    nullr : 100 * (recentq.nullr - nearq.nullr) / nearq.nullr,
                    pager : 100 * (recentq.pager - nearq.pager) / nearq.pager,
                    page : 100 * (recentq.page - nearq.page) / nearq.page
                };
                res.render('selog/index', {title: '检索/点击-重庆维普日志平台', request : req, recentq: recentq, rate : rate});
            }
            else{
                res.render('selog/index', {title: '检索/点击-重庆维普日志平台', request : req, recentq: recentq});
            }
        });
};

exports.history = function(req, res){
    models.SEStat.findAll()
        .then(function(data){
            res.json(data);
        });
};

exports.hotq = function(req, res){
    var rn = 20;
    var m = req.body.m;
    if(m == "count"){
        models.Keyword.count().then(function(count){
            count = count % rn == 0 ? count / rn : count / rn + 1;
            res.json(count);
        });
    }
    else if(m == "words"){
        var p = parseInt(req.body.p);
        if(isNaN(p)){
            p = 1;
        }
        p--;
        models.Keyword.findAndCountAll ({order: 'freq DESC, word', limit: rn, offset: p * rn})
            .then(function(data){
                res.render('selog/hotq', {data: data.rows, offset: p * rn, t: moment().subtract(1, 'days').format('YYYY-MM-DD')});
            });
    }
    else{
        res.json(-1);
    }
};

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};
var models  = require('../models');
var soap = require('soap');
var moment = require('moment');
var config = require("../config/config.json");
var util = require("util");

var HALF_DELTA_MINS = 10;
var SEG_DURATION_MINS = 60;
var SESSION_LIMIT = 500;

exports.index = function(req, res) {
    if(typeof req.query.q == "undefined" ||
        typeof req.query.t == "undefined" ||
        req.query.t.split("-").length != 3) {
        res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req});
        return;
    }
    var p = parseInt(req.query.p);
    if(isNaN(p)){
        p = 0;
    }
    q = req.query.q;
    t = req.query.t.split("-");

    var url = config.development.impala;
    var args = {selectSql: ('select user_session_id from view_down_infos ' +
        'where catalog=3 and user_session_id != "" and ' + 'keywords="{3}" and ' +
        'year={0} and month={1} and day={2} group by user_session_id')
            .format(t[0], t[1], t[2], q)};
    soap.createClient(url, function(err, client) {
        if(err != null){
            res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req, err: -1});
        }
        else{
            client.query(args, function(err, result) {
                if(err != null || JSON.parse(result["return"]).exception){
                    res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req, err: -1});
                }
                else{
                    result = JSON.parse(result["return"]).results;
                    if(p < 0 || p >= result.length){
                        res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req, err: 0});
                    }
                    else{
                        var tn = result.length;
                        var sid = result[p].user_session_id;
                        args.selectSql = ('select visit_time from view_down_infos ' +
                            'where catalog=3 and user_session_id="{0}" and keywords="{1}" and ' +
                            'year={2} and month={3} and day={4}')
                            .format(sid, q, t[0], t[1], t[2]);
                        client.query(args, function(err, result) {
                            if(err != null || JSON.parse(result["return"]).exception){
                                res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req, err: -1});
                            }
                            else{
                                result = JSON.parse(result["return"]).results;
                                var vtimes = [];
                                for(var i in result){
                                    vtimes.push(result[i].visit_time);
                                }
                                vtimes = vtimes.sort();
                                var duration = durationSegmentation(vtimes);
                                duration = durationMerge(duration);
                                expandDuration(duration);
                                args.selectSql = ('select * from view_down_infos ' +
                                    'where catalog=3 and user_session_id="{0}" and ({1}) and ' +
                                    'year={2} and month={3} and day={4} ' +
                                    'order by visit_time limit {5}')
                                    .format(sid, durationSql(duration), t[0], t[1], t[2], SESSION_LIMIT);
                                client.query(args, function(err, result) {
                                    if(err != null || JSON.parse(result["return"]).exception){
                                        res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req, err: -1});
                                    }
                                    else{
                                        result = JSON.parse(result["return"]).results;
                                        res.render('session/index', {title: 'Session回放-重庆维普日志平台', request : req, sid:sid, tn: tn, result: result});
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
};

function durationSegmentation(vtimes){
    var vduration = [];
    var i = 0;
    while(i < vtimes.length){
        var s1 =  moment(vtimes[i]);
        var s2 = moment(vtimes[i]).add(SEG_DURATION_MINS, 'minutes');
        var forward = false;
        while(moment(vtimes[i]) <= s2 && i < vtimes.length){
            forward = true;
            i++;
        }
        if(forward){
            vduration.push({s1: s1.format("YYYY-MM-DD HH:mm:ss.0"), s2: vtimes[i - 1]});
        }
        else{
            vduration.push({s1: s1.format("YYYY-MM-DD HH:mm:ss.0"), s2: s1.format("YYYY-MM-DD HH:mm:ss.0")});
            i++;
        }
    }
    return vduration;
}

function durationMerge(vduration){
    var duration = [];
    for(var i in vduration){
        if(i == 0){
            duration.push(vduration[i]);
        }
        else{
            if(moment(duration[duration.length - 1].s2).add(2 * HALF_DELTA_MINS, 'minutes') < moment(vduration[i].s1)){
                duration.push(vduration[i]);
            }
            else{
                duration[duration.length - 1].s2 = vduration[i].s2;
            }
        }
    }
    return duration;
}

function expandDuration(vduration){
    for(var i in vduration){
        vduration[i].s1 = moment(vduration[i].s1).subtract(HALF_DELTA_MINS, 'minutes').format("YYYY-MM-DD HH:mm:ss.0");
        vduration[i].s2 = moment(vduration[i].s2).add(HALF_DELTA_MINS, 'minutes').format("YYYY-MM-DD HH:mm:ss.0");
    }
}

function durationSql(duration){
    sql = [];
    for(var i in duration){
        sql.push('(visit_time > "{0}" and visit_time < "{1}")'.format(duration[i].s1, duration[i].s2));
    }
    sql = sql.join(" or ");
    return sql;
}

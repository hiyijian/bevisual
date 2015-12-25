var express = require('express');
var session = require('express-session');
var moment = require('moment')
var engine = require('ejs-locals');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer')
var ejs = require('ejs');
var models = require("./models");
var router = express.Router();

var routes = require('./routes');
var selog = require('./routes/selog');
var sessions = require('./routes/session');
var recommend = require('./routes/recommend');
var compare = require('./routes/compare');
var app = express();

app.set('port', process.env.PORT || 80);

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(multer({inMemory : true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
    secret: 'viplog',
    resave: false,
    saveUninitialized: true
}))

//routers
app.use(router);
app.get('/', routes.index);
app.get('/index', routes.index);
app.post('/dologin', routes.dologin);
app.get('/register', routes.register);
app.post('/doregister', routes.doregister);
app.get('/logout', routes.logout);
app.get('/tools/selog/', selog.index);
app.post('/tools/selog/hotq', selog.hotq);
app.get('/tools/selog/history', selog.history);
app.get('/tools/session/', sessions.index);
app.get('/tools/recommend/', recommend.index);
app.get('/tools/recommend/sample', recommend.sample);
app.post('/tools/recommend/user_table', recommend.user_table);
app.get('/tools/recommend/u', recommend.u);
app.post('/tools/recommend/history', recommend.history);
app.post('/tools/recommend/rlist', recommend.rlist);
app.get('/tools/compare/index', compare.index);
app.post('/tools/compare/user_topic', compare.user_topic);
app.post('/tools/compare/doc_topic', compare.doc_topic);
app.post('/tools/compare/doc_user_common', compare.doc_user_common);
app.post('/tools/compare/word_cloud', compare.word_cloud);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

models.sequelize.sync().then(function () {
    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + server.address().port);
    });
});

//ejs filters
ejs.filters.prettyDTD = function(t1, t2) {
    var seconds = Math.floor((t1 - (t2))/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    var message = "";
    if(hours > 0){
        message += hours + "小时";
    }
    if(minutes > 0){
        message += minutes + "分";
    }
    if(seconds > 0 || message == ""){
        message += seconds + "秒";
    }
    return message;
};


ejs.filters.prettyD = function(t) {
	return moment(t).format('YYYY-MM-DD HH:mm:ss');
};

module.exports = app;

$(document).ready(function() {
    dologin();
    fregisterValid();
    $('.fileinput').fileinput();
    doregister();
});

function fregisterValid(){
    $('#fregister').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            username: {
                validators: {
                    notEmpty: {
                        message: '必填'
                    },
                    emailAddress: {
                        message: '非法的邮箱'
                    }
                }
            },
            nickname: {
                validators: {
                    notEmpty: {
                        message: '必填'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: '必填'
                    },
                    identical: {
                        field: 'password2',
                        message: '密码不一致'
                    }
                }
            },
            password2: {
                validators: {
                    notEmpty: {
                        message: '必填'
                    },
                    identical: {
                        field: 'password',
                        message: '密码不一致'
                    }
                }
            }
        }
    });
}

function dologin(){
    var options = {
        dataType : "json",
        success: function(data){
            if(data.err == 0) {
                location.reload(true);
            }
            else if(data.err == 1) {
                $("#nav-from input[type=email]").val("");
                $("#nav-from input[type=email]").attr("placeholder", "用户名不存在");
            }
            else if(data.err == 2){
                $("#nav-from input[type=password]").val("");
                $("#nav-from input[type=password]").attr("placeholder", "密码错误");
            }
            else if(data.err == 3){
                $("#nav-from input[type=email]").val("");
                $("#nav-from input[type=email]").attr("placeholder", "数据库错误，请重试");
            }
        },
        error : function(jqXHR, textStatus, errorThrown ){
            $("#nav-from input[type=email]").val("");
            $("#nav-from input[type=email]").attr("placeholder", "提交失败，请重试");
        },
        beforeSubmit: function(arr, form, options) {
            var email = $("#nav-from input[type=email]").val();
            var password = $("#nav-from input[type=password]").val();
            var mailreg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!mailreg.test(email)){
                $("#nav-from input[type=email]").val("");
                $("#nav-from input[type=email]").attr("placeholder", "非法的邮箱");
                return false;
            }
            if(password == ""){
                $("#nav-from input[type=password]").attr("placeholder", "密码不能为空");
                return false;
            }
            return true;
        }
    };
    $("#nav-from").ajaxForm(options);
}

function doregister(){
    var options = {
        dataType : "json",
        success: function(data){
            if(data.err == 0) {
                $("#msgbox").html('<div class="col-xs-4 alert alert-success" role="alert">创建成功</div>');
            }
            else if(data.err == 1) {
                $("#msgbox").html('<div class="col-xs-4 alert alert-danger" role="alert">该用户已存在</div>');
            }
            else if(data.err == 2){
                $("#msgbox").html('<div class="col-xs-4 alert alert-danger" role="alert">数据库操作失败，请稍后重试</div>');
            }
        },
        error : function(jqXHR, textStatus, errorThrown ){
            $("#msgbox").html('<div class="col-xs-4 alert alert-danger" role="alert">网络异常，请重试</div>');
        }
    };
    $("#fregister").ajaxForm(options);
}

function ontab(tab, target, action, callback){
    $(tab).click(function(){
        if($(target).find(".loaded").length != 0){
            return;
        }
        $("#loading").show();
        $.get(action, function(data){
            $("#loading").hide();
            callback(data);
            $(target).append('<p class="loaded" style="display:none;"></p>');
        }).fail(function(){
                $("#loading").hide();
                $(target).html('<p></p><center>对不起，服务器内部错误，请重试</center>');
           });
    });
}

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + "-" +(mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};

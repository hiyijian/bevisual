$(document).ready(function() {
    user();
    history();
    rlist();
});

function user(){
    $.post("/tools/recommend/user_table", { m: "count"}, function(count){
        $('#user_pager').bootpag({
            total: count,
            maxVisible : 10
        }).on("page", function(event,  num){
                $.post("/tools/recommend/user_table", { m: "user", p: num - 1}, function(html){
                    $("#user_box").html(html);
                });
        });
        $.post("/tools/recommend/user_table", { m: "user", p: 0}, function(html){
            $("#user_box").html(html);
        });
    });
}


function history(){
    var uid = $("#uid").attr("value");
    $.post("/tools/recommend/history", { m: "count", uid: uid}, function(count){
        $('#history_pager').bootpag({
            total: count,
            maxVisible : 20
        }).on("page", function(event,  num){
                $.post("/tools/recommend/history", { m: "history", uid: uid, p: num - 1}, function(html){
                    $("#history_box").html(html);
                });
        });
        $.post("/tools/recommend/history", { m: "history", uid: uid, p: 0}, function(html){
            $("#history_box").html(html);
        });
    });
}

function rlist(){
    var uid = $("#uid").attr("value");
    $.post("/tools/recommend/rlist", { m: "count", uid: uid}, function(count){
        $('#rlist_pager').bootpag({
            total: count,
            maxVisible : 20
        }).on("page", function(event,  num){
                $.post("/tools/recommend/rlist", { m: "rlist", uid: uid, p: num - 1}, function(html){
                    $("#rlist_box").html(html);
                });
        });
        $.post("/tools/recommend/rlist", { m: "rlist", uid: uid, p: 0}, function(html){
            $("#rlist_box").html(html);
        });
    });
}


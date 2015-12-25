$(document).ready(function() {
    ontab("#se-tabs #history-tab", "#se-content #history", "/tools/selog/history", plotHistory);
    $("#se-tabs #today-tab").click();
    hotq();
});

function hotq(){
    $.post("/tools/selog/hotq", { m: "count"}, function(count){
        $('#hotq_pager').bootpag({
            total: count,
            maxVisible : 10
        }).on("page", function(event,  num){
                $.post("/tools/selog/hotq", { m: "words", p: num}, function(html){
                    $("#hotq_box").html(html);
                });
        });
        $.post("/tools/selog/hotq", { m: "words", p: 1}, function(html){
            $("#hotq_box").html(html);
        });
    });
}

function plotHistory(data){
    plot("检索总次数", data, "search-plot", "", function(stat){
        return stat.search;
    });
    plot("点击率", data, "ctr-plot", "%", function(stat){
        return 100.0 * stat.search_with_click / stat.search;
    });
    plot("平均点击次数", data, "click-plot", "", function(stat){
        return 1.0 * stat.click / stat.search;
    });
    plot("平均首次点击位置", data, "ctp-plot", "", function(stat){
        return 1.0 * stat.first_ctp_sum / stat.search_with_click;
    });
    plot("平均首次点击时间", data, "ctt-plot", "s", function(stat){
        return 1.0 * stat.first_ctt_sum / stat.search_with_click;
    });
    plot("无结果率", data, "nullr-plot", "%", function(stat){
        return 100.0 * stat.null_search / stat.search;
    });
    plot("翻页率", data, "pager-plot", "%", function(stat){
        return 100.0 * stat.pagenation / stat.search;
    });
    plot("平均翻页次数", data, "page-plot", "", function(stat){
        return 1.0 * stat.pagenation_sum / stat.search;
    });

}

function plot(title, data, target, suffix, callback){
    var canvas = echarts.init(document.getElementById(target), e_infographic);
    var d = [];
    for(var i in data){
        var stat = data[i];
        t = stat.time.split("-");
        d.push([new Date(parseInt(t[0]), parseInt(t[1]) - 1, parseInt(t[2])), callback(stat)]);
    }
    var option = {
        title : {
            text: title
        },
        dataZoom: {
            show: true
        },
        tooltip : {
            trigger: 'axis',
            formatter: function(axis){
                return axis.data[0].yyyymmdd() + ": " + (axis.data[1]).toFixed(2) + suffix;
            }
        },
        toolbox: {
            show : true,
            feature : {
                dataView : {show: true, readOnly: false},
                magicType : {show: false},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'time',
                axisLabel : {
                    formatter: function (date){
                        return date.yyyymmdd();
                    }
                }
            }
        ],
        yAxis : [
            {
                type : 'value',
                scale: false,
                axisLabel : {
                    formatter: "{value}" + suffix
                }
            }
        ],
        series : [
            {
                type:'line',
                data: d
            }
        ]
    };
    canvas.setOption(option);
}
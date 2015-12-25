$(document).ready(function() {
    plot_compare();
    plot_user_pie();
    plot_doc_pie();
    
});

function plot_compare(){
    var uid = $("#uid").attr("value");
    var docid = $("#docid").attr("value");
    $.post("/tools/compare/doc_user_common", {uid: uid, docid: docid}, function(data){
        plot_radar("rader", data);
    });
}

function plot_user_pie(){
    var uid = $("#uid").attr("value");
    $.post("/tools/compare/user_topic", {uid: uid}, function(data){
	   plot_pie("user_pie", data);
    });
}

function plot_doc_pie(){
    var dicid = $("#docid").attr("value");
    $.post("/tools/compare/doc_topic", {docid: dicid}, function(data){
        plot_pie("doc_pie", data);
    });
}

function plot_pie(target, data){
  var canvas = echarts.init(document.getElementById(target), e_infographic);
  canvas.on('click', on_click_topic);
  var d = [];
  for(var i in data.main){
	  d.push({name : data.main[i].serial, value: data.main[i].rate});
  }
  if(data.c - data.main.length > 0){
    d.push({name: '其他(' + (data.c - data.main.length) + '个)', value: data.other})
  }
    
  option = {
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    calculable : true, 
    series : [
        {
            name:'主题ID',
            type:'pie',
            radius : '50%',
            center: ['50%', '50%'],
            data: d
        }
    ]
  };
  canvas.setOption(option);
}

function plot_radar(target, data){
    var canvas = echarts.init(document.getElementById(target), e_infographic);
    canvas.on('click', on_click_topic);
    indicator = [];
    for(var i in data.topic)
    {
        max = Math.max(data.user_rate[i], data.doc_rate[i]);
        indicator.push({text : data.topic[i], max: max});
    }
    option = {
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            orient : 'vertical',
            x : 'right',
            y : 'bottom',
            data:['用户','文档']
        },
        polar : [
            {
               indicator : indicator
            }
        ],
        calculable : true,
        series : [
            {
                name: '用户 vs 文档',
                type: 'radar',
                data : [
                    {
                        value : data.user_rate,
                        name : '用户'
                    },
                     {
                        value : data.doc_rate,
                        name : '文档'
                    }
                ]
            }
        ]
    };
    canvas.setOption(option);          
}

function plot_wordcloud(topic, target, data)
{
	function createRandomItemStyle() {
    		return {
        	normal: {
            		color: 'rgb(' + [
               		 	Math.round(Math.random() * 160),
               			Math.round(Math.random() * 160),
             			Math.round(Math.random() * 160)
            		].join(',') + ')'
        	}
    		};
	}
    	var canvas = echarts.init(document.getElementById(target), e_infographic);
	d = [];
	for(var i in data.main){
		d.push({name: data.main[i].word, value: data.main[i].rate, itemStyle: createRandomItemStyle()})
	}
	option = {
		title: {
        		text: '主题-' + topic + "的word分布",
			x:'center'
    		},
    		tooltip: {
        		show: true
    		},
    		series: [{
			type: 'wordCloud',
			size: ['80%', '80%'],
			textRotation : [0, 45, 90, -45],
			textPadding: 0,
			autoSize: {
				enable: true,
            			minSize: 14
			},
			data : d
    		}]
	};
	canvas.setOption(option);                    
}

function on_click_topic(param)
{
	topic = param.name;
	$.post("/tools/compare/word_cloud", {tid: topic}, function(data){
        	plot_wordcloud(topic, "word_cloud", data);
	});	
}

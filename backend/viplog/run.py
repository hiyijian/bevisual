#! /usr/bin/python
from suds.client import Client as suds
import json, commands, os, urllib2, argparse
from import_stat import import_stat
from import_q import import_q

parser = argparse.ArgumentParser(description="search-click log import, analysis, storn")
parser.add_argument("-y", help="year(YYYY)")
parser.add_argument("-m", help="month(MM)")
parser.add_argument("-d", help="day(dd)")
args = parser.parse_args()

JAVA_BIN = "/usr/local/vipcloud/jdk/bin/java"
#HADOOP_BIN = "./hadoop/bin/hadoop"
HADOOP_BIN = "hadoop"
HADOOP_WORK_DIR = "/VipLogData"
MR_HOME = "./"
MYSQL_HOST = "localhost"
MYSQL_DB = "viplog"
MYSQL_U = "root"
MYSQL_P = "root"
LIMIT = 5000
WSDL = 'http://192.168.51.160:9100/VipCloud/Service/BehaviorAlanalysis?wsdl'
#sql impala for raw logs
sqlfiles = []
print "sql impala for raw logs"
try:
	ws = suds(WSDL)
	sql = "select count(*) from view_down_infos where not vip_is_spider_strict(user_browser) and catalog=3 and year=%s and month=%s and day=%s" % (args.y, args.m, args.d)
	count = ws.service.query(sql)
	count = json.loads(count)
	if count["exception"]:
		print "sql query wrong, exit"
		exit(-1)
	count = int(count["results"][0]["count(*)"])
	if count == 0:
		print "no data, exit"
		exit(-1)

	fileno = count / LIMIT if count % LIMIT == 0 else count / LIMIT + 1
	for i in range(fileno):
		sql = "select user_session_id, visit_time, type, keywords, table_name, return_counts, offset_counts, total_counts, sort_by, click_position, user_browser, user_ip from view_down_infos where not vip_is_spider_strict(user_browser) and catalog=3 and year=%s and month=%s and day=%s order by visit_time limit %d offset %d" % (args.y, args.m, args.d, LIMIT, i * LIMIT)
		ret = ws.service.query(sql)
		ret = json.loads(ret)
		if ret["exception"]:
			print "sql query wrong, exit"
			exit(-1)
		logs = ret["results"]
		sqlfiles.append('raw-%d' % i)
		fd = open('raw-%d' % i, 'w')
		for log in logs:
			fd.write(json.dumps(log))
			fd.write("\n")
		fd.close()
except SystemExit as e:
	exit(-1)
except:
	print "failed to sql query, exit"
	exit(-1)
#write to hdfs
print "write to hdfs"
code = commands.getstatusoutput("%s dfs -rm %s/raw/*" %(HADOOP_BIN, HADOOP_WORK_DIR))[0]
if code != 0:
	print "failed to hdfs operation"
	exit(-1)
code = commands.getstatusoutput("%s dfs -put %s %s/raw/" %(HADOOP_BIN, " ".join(sqlfiles), HADOOP_WORK_DIR))[0]
if code != 0:
	print "failed to hdfs operation"
	exit(-1)
for f in sqlfiles:
	os.remove(f)

#startup mapreduce task
print "startup mapreduce task"
code = commands.getstatusoutput("cd %s && rm -rf status && %s -jar DataAnalysis-vip-0.0.1-SNAPSHOT.jar -jobStreamName=log -dataAnalysisName=log  && cd -" % (MR_HOME, JAVA_BIN))[0]
if code != 0:
	print "failed to exec mapreduce task"
	exit(-1)

#fetch and write result of mrepduce task
print "fetch and write result of mrepduce task"
#ctr
commands.getstatusoutput("rm -f ./part-r-00000")
code = commands.getstatusoutput("%s dfs -get %s/ctr/part-r-00000 ." %(HADOOP_BIN, HADOOP_WORK_DIR))[0]
if code != 0:
        print "failed to get ctr result, exit"
        exit(-1)
if not import_stat("./part-r-00000", MYSQL_HOST, MYSQL_DB, MYSQL_U, MYSQL_P, "%s-%s-%s" % (args.y, args.m, args.d)):
        print "failed to write ctr result, exit"
	exit(-1)
#keyword
commands.getstatusoutput("rm -f ./part-r-00000")
code = commands.getstatusoutput("%s dfs -get %s/keyword/part-r-00000 ." %(HADOOP_BIN, HADOOP_WORK_DIR))[0]
commands.getstatusoutput("sort -r ./part-r-00000 | head -500 > tmp")
commands.getstatusoutput("mv ./tmp ./part-r-00000")
if code != 0:
        print "failed to get keyword result, exit"
        exit(-1)
if not import_q("./part-r-00000", MYSQL_HOST, MYSQL_DB, MYSQL_U, MYSQL_P):
        print "failed to write keyword result, exit"
	exit(-1)
commands.getstatusoutput("rm -f ./part-r-00000")

exit(0)

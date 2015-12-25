# -*- coding: utf-8 -*-
import MySQLdb
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

def import_q(infile, host, db, user, passwd):
	fd = open(infile, 'r')
	lines = fd.readlines()
	values = []
	filter = set()
	for line in lines:
		idx = line.find("\t")
		freq = line[:idx] 
		word = line[idx + 1:].lower()
		if word in filter:
			continue
		if len(word) > 255:
			continue
		values.append((word, freq))
		filter.add(word)
	fd.close()
	try:
		conn = MySQLdb.connect(db=db, host=host ,user=user, passwd=passwd, charset="utf8")
		cur = conn.cursor()
		cur.execute('SET NAMES utf8')
		#cur.execute("SET NAMES utf8mb4;") 	
		#cur.execute("SET CHARACTER SET utf8mb4;")
		#cur.execute("SET character_set_connection=utf8mb4;")
		cur.execute("TRUNCATE TABLE Keywords")
		conn.commit()
		sql = """
		INSERT INTO Keywords(word, freq)
		VALUES (%s, %s)
		"""
		cur.executemany(sql, values)
		conn.commit()
		cur.close()
		conn.close()
	except Exception,e:
		print e
		return False
	return True
	

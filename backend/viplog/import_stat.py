import MySQLdb

def import_stat(infile, host, db, user, passwd, time):
	fd = open(infile, 'r')
	line = fd.readline()
	ret = line.split("\t")
	if len(ret) != 8:
        	return False
	fd.close()
	try:
		conn = MySQLdb.connect(db=db, host=host ,user=user, passwd=passwd)
		cur = conn.cursor()
		sql = """
		INSERT INTO SEStats(time, search, null_search, search_with_click, click, first_ctp_sum, first_ctt_sum, pagenation, pagenation_sum)
         	VALUES ("%s", %s, %s, %s, %s, %s, %s, %s, %s)
		"""
		sql = sql % (time, ret[0], ret[1], ret[2], ret[3], ret[4], ret[5], ret[6], ret[7])
		cur.execute(sql)
		conn.commit()
		cur.close()
		conn.close()
	except:
		return False
	return True

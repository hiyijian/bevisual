#!/bin/sh

for((i=0;i<=3;i++));
do 
	d=`date -d "2015-12-04 +${i} day " +'-y %Y -m %m -d %d'`
	echo $d
	python ./run.py $d
done

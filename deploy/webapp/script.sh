#!/bin/sh

set -x
# mysql -h new-database.c35vvuoa1dkn.us-east-1.rds.amazonaws.com -P 3306 -ucsye7374master -pcsye7374password
# until mysql -h new-database.c35vvuoa1dkn.us-east-1.rds.amazonaws.com -P 3306 -ucsye6225master -pcsye6225password ;
# do 
# 	echo "waiting for database"
# 	sleep 2	 
# done

DBhostname=$(jq -r '.["DB_HOST"]' /app/secret/Secrets.json)
DBuser=$(jq -r '.["DB_USER"]' /app/secret/Secrets.json)
DBpass=$(jq -r '.["DB_PASS"]' /app/secret/Secrets.json)
echo $DBhostname
echo $DBuser
echo $DBpass

until $(echo 'exit' | mysql -h $DBhostname -P 3306 -u$DBuser -p$DBpass); do 
    echo "waiting for database"
	sleep 2	
done

mysql -h $DBhostname -P 3306 -u$DBuser -p$DBpass -e 'use csye6225'
if [ $? -eq 0 ]
then
    echo "database $DBNAME exist."
	mysql -h $DBhostname -P 3306 -u$DBuser -p$DBpass -e 'Select * from csye6225.user'
	if [ $? -eq 0 ]
	then
		echo "Schema exist"
	else
		mysql -h $DBhostname -P 3306 -u$DBuser -p$DBpass < /tmp/tables.sql
	fi
else
    echo "database $DBNAME does not exist."
	mysql -h $DBhostname -P 3306 -u$DBuser -p$DBpass -e 'CREATE DATABASE csye6225'
	mysql -h $DBhostname -P 3306 -u$DBuser -p$DBpass < /tmp/tables.sql
	echo "database created succesfully"
fi


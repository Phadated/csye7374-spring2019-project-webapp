#!/bin/sh

set -x

## Setup
export RELEASE_NAME=my-confluent
export ZOOKEEPERS=${RELEASE_NAME}-cp-zookeeper:2181
export KAFKAS=${RELEASE_NAME}-cp-kafka-headless:9092

## Create Topic
kafka-topics --zookeeper $ZOOKEEPERS --create --topic PWDRESET --partitions 2 --replication-factor 3
if [ $? -eq 0 ]
then
	echo "Topic created successfully"
else
	echo "Topic already exist"
fi

echo "the list of topics"
kafka-topics --zookeeper $ZOOKEEPERS --list 
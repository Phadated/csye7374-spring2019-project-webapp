# csye7374-spring2019-project-webapp

This application will be the Kafka producer. Password reset endpoint will send the message to Kafka topic. 
Main web application will use Kafka message queue to send messages to Notifier web application. Notifier web application will then forward the message to the AWS SNS topic.

## Init Container
- init container will check if RDS is setup with your database schema. If schema exists, init container will not do nothing. If schema does not exist, it will create the schema.
- init container will check if Kafka topic exists. Topic will be created if it does not exist.

## Ansible Roles and Playbooks (Infrastructure as code and Configuration Management)
``` build_db_image.yml ``` - Build the init conatiner image required to bootstrap the RDS.

``` build_kafka_image.yml``` - Build the init conatiner image required to create Kafka topic.

``` buildimage.yml ``` - Build the Node js web application image

``` hpa-playbook.yml ``` - Deploy horizontal pod scaler onto cluster.

``` push_db_image.yml``` - Push the image to xxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/init-db ecr repository

``` push_kafka_image.yml``` - Push the image to xxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/init-kafka ecr repository

``` pushimage.yml ``` - Push the image to xxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/csye7374 ecr repository

``` rc-playbook.yml ``` - Deploy the web application container replicas and load balancer service on cluster

``` rc-terminate-playbook.yml``` - Terminate the the web application containers


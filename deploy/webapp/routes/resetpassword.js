const fs = require('fs');
var jwt = require('jsonwebtoken');
var SECRET_KEY = "AnKmJainism";
var validator = require("email-validator");
var AWS = require('aws-sdk');
let config = JSON.parse(fs.readFileSync('./config/config.json'));
let secret = JSON.parse(fs.readFileSync('./secret/Secrets.json'));
const kafka = require('kafka-node');
const bp = require('body-parser');

AWS.config.update({
    // accessKeyId: process.env.AWS_ACCESS_KEY,
    // secretAccessKey: process.env.AWS_SECRET_KEY,
    region: secret.REGION,
    domain: secret.DOMAIN_NAME
    // region: 'us-east-1',
    // domain: 'csye6225-fall2018-jainneh.me'
  });

var sns = new AWS.SNS();



// var kafka_topic = [{
// topic:'PWDRESET',
// partitions: 2,
// replicationFactor: 3

// }]

// 
var kafka_topic=secret.topicname;
// var kafka_server= '100.68.95.191:9092'
var kafka_server=secret.kafkaserver;
console.log("Kafka Server "+kafka_server);


// client.createTopics(kafka_topic, (error, result) =>{
// 	console.error("error", error);
// 	console.error("error", result);
// })

module.exports = {
    
    
    resetpassword: (req, res) => {
      // client.increment('resetpassword.http.post');		
      var username = req.body.username;
      var token = jwt.sign({ username: username}, SECRET_KEY, { expiresIn: 5000 });
      var mydomain =  secret.DOMAIN_NAME;
      var region =  secret.REGION;

        if(validator.validate(username)){

        
            db.query("SELECT 1 FROM user WHERE username = ? ORDER BY username LIMIT 1", [username], function (error, results, fields) {
                if (error) {
                   
                   return res.status(400).json({ success: false, msg: err});
                   
                }
                if (results.length < 1) {
                   
                   res.status(400).json({ success: false, msg: 'User doesnot exists. Please retry'});

                } else {
                	  
					  var client = new kafka.KafkaClient({kafkaHost: kafka_server});

					  var producer = new kafka.HighLevelProducer(client);
						const admin = new kafka.Admin(client);
						//console.log("producer ", producer);

						// admin.listTopics((err, res) => {
						// 	console.log('before err', err);
						// 	console.log('before topics', res);

						// });
						
						// client.createTopics(kafka_topic, (error, result) =>{
					  // 	console.log("error", error);
					  // 	console.log("result", result);
					  // });
					  
						// admin.listTopics((err, res) => {
						// 	console.log('after err', err);
						// 	console.log('after topics', res);

						// });
					  const payloads = [
					    {
					      topic:kafka_topic,
					      messages: username+","+ token+","+ mydomain+","+region
					      
					    }
					  ];
					  
					  console.log(payloads);

					  producer.on('ready', async function() {
							console.log('in ready');
					    let push_status = producer.send(payloads, (err, data) => {
					      if (err) {
					        console.log('[kafka-producer -> '+kafka_topic+']: broker update failed');
					        throw err;


					      } else {
					        console.log('[kafka-producer -> '+kafka_topic+']: broker update success');
					        console.log(kafka_topic);
					        res.status(200).json({ success: true, msg: kafka_topic});
					      }
					    });
					  });
						
						// admin.listTopics((err, res) => {
						// 	console.log('after err', err);
						// 	console.log('after topics', res);

						// });

					  producer.on('error', function(err) {
					    console.log("prod err :", err);
					    console.log('[kafka-producer -> '+kafka_topic+']: connection errored');
					    throw err;

					  });


                }
            });
                
               
        }   
        else {
                      res.status(400).json({ success: false, msg: 'Username is invalid'});
        }
      }
        

            

}

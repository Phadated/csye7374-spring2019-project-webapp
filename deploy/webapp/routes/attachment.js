const fs = require('fs');
const jwt = require('jsonwebtoken');
var SECRET_KEY = "AnKm";
const path = require('path');
const homedir = require('os').homedir();
const mkdirp = require('mkdirp');
const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
require('dotenv').config()
const promClient = require('prom-client');

//var config = require('../config').get(process.env.NODE_ENV);
/////////

const addAttachmentsCounter = new promClient.Counter({ 
	name: 'add_attachment_counter', 
	help: 'Number of visits to /transaction/:id/attachments  - http.post' 
});

const deleteAttachmentsCounter = new promClient.Counter({ 
	name: 'delete_attachment_counter', 
	help: 'Number of visits to /transaction/:id/attachments/:attachmentid  - http.delete' 
});

const editAttachmentsCounter = new promClient.Counter({ 
	name: 'edit_attachment_counter', 
	help: 'Number of visits to /transaction/:id/attachments/:attachmentid  - http.put' 
});

const getAttachmentsCounter = new promClient.Counter({ 
	name: 'get_attachment_counter', 
	help: 'Number of visits to /transaction/:id/attachments - http.get' 
});

const streamifier = require('streamifier');
let secret = JSON.parse(fs.readFileSync('./secret/Secrets.json'));
////////
var dir = homedir + '/temp_storage/assets/images/'
// var dirCloud = homedir + '/temp_storage/assets/s3/'

//console.log("fs readStream",fs.createReadStream(dirCloud));
if (!fs.existsSync(dir)) {
	mkdirp.sync(dir);
	console.log("Path created");
}

// if (!fs.existsSync(dirCloud)) {
// 	mkdirp.sync(dirCloud);
// 	console.log("s3 Path created");
// }

//console.log("config------ :", config);
// var bucket_name = process.env.S3_BUCKET;
// if (process.env.NODE_ENV === "dev") {
// 	console.log("Running in dev env.... AWS Configured");
// 	// AWS.config.update({
// 	// 	accessKeyId: process.env.AWS_ACCESS_KEY,
// 	// 	secretAccessKey: process.env.AWS_SECRET_KEY
// 	// });


// }

var bucket_name = secret.S3_BUCKET
var s3 = new AWS.S3();
function deleteFile(attachment_id) {
	query = "SELECT url from attachment where ID = '" + attachment_id + "'";
	db.query(query, (err, result) => {
		if (err) {
			return res.status(400).send(err);
		}
		else if (result.affectedRows < 1) {
			return res.status(400).json({ success: false, msg: 'attachment Id is incorrect' });
		}
		console.log(result);
		fs.unlink(result[0].url, function (err) {
			if (err) throw err;
			// if no error, file has been deleted successfully
			console.log('File deleted!');
		})
	});
}

module.exports = {



	addAttachments: (req, res) => {

		client.increment('addAttachments.http.post');
		addAttachmentsCounter.inc();		
		var token = req.headers['x-access-token'];
		if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

		jwt.verify(token, SECRET_KEY, function (err, decoded) {

			if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
			else {
				//add code here
				if (!req.files) {
					return res.status(400).send("No files were uploaded.");
				}
				else {
					let uploadedFile = req.files.image;
					//console.log(uploadedFile);
					let image_name = uploadedFile.name;
					//console.log(image_name);
					let fileExtension = uploadedFile.mimetype.split('/')[1];

					let transction_id = req.params.id;

					if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/jpg') {
						// upload the file to the /public/assets/img directory
						//console.log("configNAme:", config.name)
						if (process.env.NODE_ENV == "default") {
							uploadedFile.mv(dir + "" + image_name, (err) => {
								if (err) {
									return res.status(500).send(err);
								}
								// send the player's details to the database
								let url = dir + "" + image_name;
								let query = "INSERT INTO attachment (ID, url, transaction_id, filename) VALUES ('" + uuidv1() + "', '" + url + "', '" + transction_id + "','" + image_name + "')";
								db.query(query, (err, result) => {
									if (err) {
										return res.status(500).send(err);
									}
									else if (result.affectedRows < 1) {
										return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or attachment is incorrect or it doesnot belong to you' });
									}

									res.status(200).json({ success: true, attachment: result });
								});
							});
						}
						else {
							var uniqueImage = Date.now() + "_" + image_name;
							var params = {
								Bucket: bucket_name,
								Body: streamifier.createReadStream(uploadedFile.data),
								Key: uniqueImage
							};

							s3.upload(params, function (err, data) {
								//handle error
								console.log("upload");
								if (err) {
									console.log("Error", err);
								}

								//success
								if (data) {
									console.log("Uploaded in:", data.Location);
									let query = "INSERT INTO attachment (ID, url, transaction_id, filename) VALUES ('" + uuidv1() + "', '" + data.Location + "', '" + transction_id + "','" + uniqueImage + "')";
									db.query(query, (err, result) => {
										if (err) {
											return res.status(500).send(err);
										}
										else if (result.affectedRows < 1) {
											return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or attachment is incorrect or it doesnot belong to you' });
										}

										res.status(200).send(result);
									});
								}
							});

						}
					} else {
						message = "Invalid File format. Only 'jpg', 'jpeg' and 'png' images are allowed.";
						return res.status(401).send({ auth: false, message: message });
					}
				}

			}
		});


	},

	
	deleteAttachments: (req, res) => {

		//get token using jwt verify
		client.increment('deleteAttachments.http.delete');
		deleteAttachmentsCounter.inc();		
		var token = req.headers['x-access-token'];
		if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

		jwt.verify(token, SECRET_KEY, function (err, decoded) {

			if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
			else {

				let transaction_id = req.params.id;
				let attachment_id = req.params.attachmentid;


				if (process.env.NODE_ENV == "default") {
					db.query("delete a from attachment as a inner join transaction on a.transaction_id = transaction.ID where a.ID = '" + attachment_id + "' and a.transaction_id = '" + transaction_id + "' and transaction.user_id = " + decoded.id,
						(err, result) => {
							if (err) {
								return res.status(500).send(err);
							}
							else if (result.affectedRows < 1) {
								return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or it doesnot belong to you' });
							}
							deleteFile(attachment_id);
							res.status(200).json({ success: true, attachment: result });
						});

				}
				else {
					query = "SELECT filename from attachment where ID = '" + attachment_id + "' and transaction_id = '" + transaction_id +"'";
					db.query(query, (err, result) => {
						if (err) {
							return res.status(500).send(err);
						}
						else if (result.affectedRows < 1) {
							return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or it doesnot belong to you' });
						}



						db.query("delete a from attachment as a inner join transaction on a.transaction_id = transaction.ID where a.ID = '" + attachment_id + "' and a.transaction_id = '" + transaction_id + "' and transaction.user_id = " + decoded.id,
							(e, r) => {
								if (e) {
									return res.status(500).send(e);
								}
								else if (r.affectedRows < 1) {
									return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or it doesnot belong to you' });
								}

								var params = {
									Bucket: bucket_name,
									Key: result[0].filename
								};

								s3.deleteObject(params, function (err, data) {
									if (err) console.log(err, err.stack); // an error occurred
									else {
										console.log("data: ", data);

									}           // successful response
								});
								res.status(200).json({ success: true, attachment: r });
							});


					});


				}
			}
		});
	},


	
	editAttachments: (req, res) => {

		//get token using jwt verify
		client.increment('editAttachments.http.put');
		editAttachmentsCounter.inc();		
		var token = req.headers['x-access-token'];
		if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

		jwt.verify(token, SECRET_KEY, function (err, decoded) {

			if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
			else {
				let uploadedFile = req.files.image;
				// console.log(uploadedFile);
				let image_name = uploadedFile.name;
				// console.log(image_name);
				let fileExtension = uploadedFile.mimetype.split('/')[1];
				// console.log(fileExtension);
				//image_name = image_name;
				// console.log(image_name);
				let transaction_id = req.params.id;
				let attachment_id = req.params.attachmentid;

				if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/jpg') {
					//upload the file to the /public/assets/img directory
					console.log("decoded id: ",decoded.id);
					let q = "SELECT 1 from attachment as a inner join transaction t on a.transaction_id = t.ID where a.ID = '" + attachment_id + "' and a.transaction_id ='" + transaction_id + "' and t.user_id = " + decoded.id;
					console.log("q: ",q);
					db.query(q, (e, r) => {
						console.log(r);
						if (e) {
							return res.status(500).send(e);
						}
						if(r.length == 0){
							console.log("affected rows < 1");
							return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect / attachment Id is incorrect or the transaction doesnot belong to you' });
						}
						if (process.env.NODE_ENV == "default") {
							deleteFile(attachment_id);  ////Deleting file 
							uploadedFile.mv(dir + "" + image_name, (err) => { // moving new file
								if (err) {
									return res.status(500).send(err);
								}
								// send the player's details to the database
								let url = dir + "" + image_name;
								console.log("url", url);
								let query = "UPDATE attachment set url = '" + url + "', filename = '" + image_name + "' where ID = '" + attachment_id + "' and transaction_id ='" + transaction_id + "'";

								db.query(query, (err, result) => {
									if (err) {
										return res.status(400).send(err);
									}
									else if (result.affectedRows < 1) {
										return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect / attachment Id is incorrect or the transaction doesnot belong to you' });
									}
									res.status(200).json({ success: true, attachment: result });

								});
							});
						}
						else {


							let q = "SELECT filename from attachment where ID = '" + attachment_id + "' and transaction_id = '" + transaction_id+ "'";
							db.query(q, (e, r) => {
								if (e) {
									return res.status(500).send(e);
								}
								else if (r.affectedRows < 1) {
									return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or attachment is incorrect or it doesnot belong to you' });
								}

								console.log(r[0].filename);
								var params = {
									Bucket: bucket_name,
									Key: r[0].filename
								};
								s3.deleteObject(params, function (err, data) {
									if (err) console.log(err, err.stack); // an error occurred
									else console.log("data: ", data);           // successful response
								});
							});

							var uniqueImage = Date.now() + "_" + image_name;
							var params = {
								Bucket: bucket_name,
								Body: streamifier.createReadStream(uploadedFile.data),
								Key: uniqueImage
							};

							s3.upload(params, function (err, data) {
								//handle error
								console.log("upload");
								if (err) {
									console.log("Error", err);
								}

								//success
								if (data) {
									console.log("Uploaded in:", data.Location);
									let query = "UPDATE attachment set url = '" + data.Location + "', filename = '" + uniqueImage + "' where ID = '" + attachment_id + "' and transaction_id ='" + transaction_id + "'";
									db.query(query, (err, result) => {
										if (err) {
											return res.status(500).send(err);
										}
										else if (result.affectedRows < 1) {
											return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or attachment is incorrect or it doesnot belong to you' });
										}

										res.status(200).json({ success: true, attachment: result });
									});
								}
							});

						}
					});

				} else {
					message = "Invalid File format. Only 'jpg', 'jpeg' and 'png' images are allowed.";
					return res.status(401).send({ auth: false, message: message });
				}

			}
		});



	},

	getAttachments: (req, res) => {

		//get token using jwt verify
		client.increment('getAttachments.http.get');
		getAttachmentsCounter.inc();		
		var token = req.headers['x-access-token'];
		if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

		jwt.verify(token, SECRET_KEY, function (err, decoded) {

			if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
			else {
				let transaction_id = req.params.id;
				let getQuery = "select * from attachment where transaction_id = '" + transaction_id + "'";

				db.query(getQuery, (err, result) => {
					if (err) {
						return res.status(500).send(err);
					}
					else if (result.affectedRows < 1) {
						return res.status(400).json({ success: false, msg: 'Either the transaction ID is incorrect or it doesnot belong to you' });
					}

					res.status(200).json({ success: true, attachment: result });
				});
			}
		});


	}


};



const fs = require('fs');
var bcrypt = require("bcrypt");
var BCYPT_SALT_ROUNDS = 12;
var auth = require('basic-auth');
var jwt = require('jsonwebtoken');
var SECRET_KEY = "AnKm";
var validator = require("email-validator");
// var StatsD = require('node-statsd');
// var client = new StatsD();
const promClient = require('prom-client');

const createUserCounter = new promClient.Counter({ 
    name: 'create_user_counter', 
    help: 'Number of visits to /user/register' 
});

const timeLoginCounter = new promClient.Counter({ 
    name: 'time_login_counter', 
    help: 'Number of visits to /time' 
});

module.exports = {
    

    createuser: (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        
        client.increment('createuser.http.post');
        if(validator.validate(username)){

        
        db.query("SELECT 1 FROM user WHERE username = ? ORDER BY username LIMIT 1", [username], function (error, results, fields) {
            if (error) {
               //return res.status(500).send(err);
               return res.status(400).json({ success: false, msg: error});
               
            }
            if (results.length > 0) {
               
               //res.send("User already exists Please retry");
               createUserCounter.inc();
               res.status(400).json({ success: false, msg: 'User already exists Please retry'});

            } else {

                    bcrypt.hash(password,BCYPT_SALT_ROUNDS)
                    .then(function(hashedPassword) {
                            var query = db.query ("INSERT INTO user  (username, password) values  ('" + username +"','" + hashedPassword +"')");
                            //res.status(200).json({ success: true, msg: 'User created'});
                    });
                    createUserCounter.inc();
                   //res.send("User already exists Please retry");
                   res.status(200).json({ success: true, msg: 'User created'});


            }
            
            });
        }

        else{
            createUserCounter.inc();
            res.status(400).json({ success: false, msg: 'Username is invalid'});
        }
    },

    getDashboardPage: (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        client.increment('login.http.get');
        console.log(auth);
        var user = auth(req);

        if (!user) {
            //return res.status(500).send("Basic-Authentication Required");
            timeLoginCounter.inc();
            return res.status(400).json({ success: false, msg: 'Basic-Authentication Required' });
        }
        else {

            let username = req.body.username;
            let password = req.body.password;
            var user = auth(req);
            console.log(user);

            db.query("SELECT * FROM user WHERE username = ? ORDER BY username LIMIT 1", [user.name]
                , function (error, results, fields) {
                    // console.log("result",results)
                    if (error) {
                        // res.send(error);
                        console.log(error);
                        res.status(400).json({ success: false, msg: error });

                    }
                    else if (results.length < 1) {
                        timeLoginCounter.inc();
                        res.status(400).json({ success: false, msg: 'Access Denied' });
                        //res.end("ACCESS DENIED");

                    } else {

                        bcrypt.compare(user.pass, results[0].password)
                            .then(function (samePassword) {
                                if (!samePassword) {
                                    timeLoginCounter.inc();
                                    res.status(403).send();
                                }
                                var date = new Date();
                                console.log(results[0].ID);
                                console.log(SECRET_KEY);

                                var token = jwt.sign({ id: results[0].ID }, SECRET_KEY, { expiresIn: 5000 });
                                console.log(token);
                                timeLoginCounter.inc();
                                res.status(200).json({ success: true, msg: 'WELCOME YOU ARE LOGGED IN.' + date, token: token });
                                //res.send(token);
                                //callback(res, token);
                            });

                    }

                });

        }

    },

    

}

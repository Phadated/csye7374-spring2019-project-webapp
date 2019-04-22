
 # Web Application for CRUD Operations using AUTHENTICATION and AUTHORRIZATION:
 This readme.md contains steps to start and run your Web Application for CRUD Operations using AUTHENTICATION and AUTHORIZATION
 
 ## Getting Started:
 For this, we will be installing NODE Js and its dependencies
 
 ## Prerequisites:
 1. VMware Work Station OR
 2. VMware Fusion(Mac) OR
 3. Oracle Virtual Box
 4. Fedora
 5. mySQL
 6. Node Js Version 8.12.0
 
 ## Installing Node Js
Install Node JS Version 8.12.0 from the following site: https://nodejs.org/en/download/ or from terminal run below command in the terminal
```
sudo dnf install nodejs
```
 
 ## For dependencies:
 Install all required node dependencies using below command in the terminal
```
npm install
```
## Starting you project:
Once all dependencies are installed, start your project using following command in the terminal
```
node app.js 
```
The server will start running on port 5000
Open your browser, type localhost:3000 and start

## Perform Operations
Open Postman application to perform CRUD operations on transaction

## To Set up configurations
The config.js file has to be made in you webapp folder and must contain all configurations like belo
```
var config = {
    Dev: {
        name: "dev",
        aws: {
            accessKeyId: "youraccesskey",
            secretAccessKey:"yoursceretaccesskey"
        },
        database: {
            host: 'databasehost',
            user: 'username',
            password: 'password',
            db_name: 'databasename'
        }
    },
    default: {
        name: "default",
        database: {
            host: 'databasehost',
            user: 'username',
            password: 'password',
            db_name: 'dataasename'
        },
        
    },
}

exports.get = function get(env) {
    return config[env] || config.default;
}
```
##TO RUN THE APPLICATION ON CLOUD EC2 INSTANCE
DEPLOY THE APPLICATION USING TRAVIS CI
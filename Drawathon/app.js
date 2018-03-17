const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookie = require('cookie');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;

const crypto = require('crypto');
const fs = require('fs');

app.use(bodyParser.json());
app.use(express.static('frontend'));

const http = require('http');
const PORT = 3000;

// The following forceSSL middleware code snippet is taken from 
// https://medium.com/@ryanchenkie_40935/angular-cli-deployment-host-your-angular-2-app-on-heroku-3f266f13f352 

// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS

const forceSSL = function() {
    return function (req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(
         ['https://', req.get('Host'), req.url].join('')
        );
      }
      next();
    }
  }
  
  // Instruct the app
  // to use the forceSSL
  // middleware
  
  app.use(forceSSL());

// Connection url
const uri = "mongodb://admin:hashedpass@art-shard-00-00-xs19d.mongodb.net:27017,art-shard-00-01-xs19d.mongodb.net:27017,art-shard-00-02-xs19d.mongodb.net:27017/test?ssl=true&replicaSet=Art-shard-0&authSource=admin"
// Database Name
const dbName = 'test';

// Connect using MongoClient
MongoClient.connect(uri, function(err, client) {    
    if (err)  return;
    if (!client) {
        console.log("No tables");
        return;
    }
    // Use the admin database for the operation
    const adminDb = client.db(dbName).admin();
    
    // List all the available databases
    adminDb.listDatabases(function(err, dbs) {
        console.log("found dbs")
        client.close();
    });
});

app.use(session({
    secret: 'please change this secret, or not',
    resave: false,
    saveUninitialized: true,
}));
//game_instance = {ownerid, password, teamIds, }
//teamIds = {teamId, Userids=[]}
//userIds = {userid, hash, imagIds=[]}
//imageIds = 



http.createServer(app).listen(process.env.PORT || PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});           

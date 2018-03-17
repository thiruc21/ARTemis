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

const http = require('http');
const PORT = 3000;

// The following forceSSL middleware code snippet is taken from 
/** https://medium.com/@ryanchenkie_40935/angular-cli-deployment-host-your-angular-2-app-on-heroku-3f266f13f352 */

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

// Allow localhost to work in HTTP, otherwise HTTPS is required
if (app.get('env') !== 'development'){
    app.use(forceSSL());
}
app.use(express.static('frontend'));
// Connection url
const uri = "mongodb://admin:hashedpass@art-shard-00-00-xs19d.mongodb.net:" +
     "27017,art-shard-00-01-xs19d.mongodb.net:27017,art-shard-00-02-xs19d.mongodb.net" + 
     ":27017/test?ssl=true&replicaSet=Art-shard-0&authSource=admin";
// Database Name
const dbName = 'test';

app.use(session({
    //cookie: {//httpOnly: true,         secure: true, sameSite: true},
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

function generateSalt (){
    return crypto.randomBytes(16).toString('base64');
}

function generateHash (password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

app.use(function(req, res, next){
    var username = (req.session.username)? req.session.username : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
          sameSite: true,
          secure: true,
          //httpOnly: false,
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var isAuthenticated = function(req, res, next) {
    console.log("\n", req.session.username, "\n")
    if (!req.session.username) return res.status(401).end("access denied");
    next();
};



// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
// Sign up with the provided credentials
app.post('/signup/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    
    MongoClient.connect(uri, function(err, db) {    
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);
        dbo.collection("users").findOne({_id: username}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("Username " + username + " already exists");

            var salt = generateSalt();
            var hash = generateHash(password, salt)
            dbo.collection("users").update({_id: username}, {_id: username, salt:salt, hash:hash}, 
                {upsert: true}, function(n, nMod) {
                    if (err) return res.status(500).end(err);
                    return res.json("User " + username + " signed up");
            });
        });
    });
});

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
app.post('/signin/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    MongoClient.connect(uri, function(err, db) {    
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);
        // retrieve user from the database
        dbo.collection("users").findOne({_id: username}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (!user) return res.status(401).end("Access denied, incorrect credentials\n");
            if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("Access denied, incorrect credentials\n"); 
            req.session.username = username;
            // initialize cookie
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                sameSite: true,
                secure: true,
                path : '/', 
                maxAge: 60 * 60 * 24 * 7
            }));
            return res.json("User " + username + " signed in");
        });
    });
    
});

// Sign out of the current user
app.get('/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 
    }));
    res.redirect('/');
});

// curl -b cookie.txt   -H "Content-Type: application/json" -X POST -d '{"title":"join THIS Lobby lol"}' localhost:3000/api/games/
app.post('/api/games/', isAuthenticated, function (req, res, next) {
    title = req.body.title;
    host = req.session.username

    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

        dbo.collection("games").insertOne({title:title, host: host}, function (err, game) {
            if (err) return res.status(500).end(err);
            return res.json(game.ops[0]);
        });
    });
});

http.createServer(app).listen(process.env.PORT || PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});       

//game_instance = {ownerid, password, teamIds, }
//teamIds = {teamId, Userids=[]}
//userIds = {userid, hash, imagIds=[]}
//imageIds = 
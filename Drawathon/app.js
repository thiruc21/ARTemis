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

// Connection url
const uri = "mongodb://admin:hashedpass@art-shard-00-00-xs19d.mongodb.net:" +
     "27017,art-shard-00-01-xs19d.mongodb.net:27017,art-shard-00-02-xs19d.mongodb.net" + 
     ":27017/test?ssl=true&replicaSet=Art-shard-0&authSource=admin";
// Database Name
const dbName = 'test';

app.use(session({
    cookie: {httpOnly: true, secure: true, sameSite: true},
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

if (app.get('env') === 'production') {
    session.cookie.secure = true;
}

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
          httpOnly: false,
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
    if (!req.session.username) return res.status(401).end("access denied");
    next();
};



// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
app.post('/signup/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = generateSalt();
    MongoClient.connect(uri, function(err, db) {    
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

        dbo.collection("users").findOne({_id: username}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("username " + username + " already exists");

            var salt = generateSalt();
            var hash = generateHash(password, salt)
            dbo.collection("users").update({_id: username}, {_id: username, salt:salt, hash:hash}, 
                {upsert: true}, function(n, nMod) {
                    if (err) return res.status(500).end(err);
                    return res.json("user " + username + " signed up");
            });
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
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookie = require('cookie');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
var ObjectID = require("mongodb").ObjectId;
const crypto = require('crypto');
const fs = require('fs');

app.use(bodyParser.json());

const http = require('http');
const PORT = 3000;

const MAXPLAYERS = 4;
var multer  = require('multer');
var upload = multer({ dest: path.join(__dirname, 'uploads') });

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
app.use(express.static('dist'));
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
    if (!req.session.username) return res.status(401).end("access denied");
    next();
};

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
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
            var hash = generateHash(password, salt);
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
    // TODO: sanitize
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
            db.close();
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

// curl -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"title":"join THIS Lobby lol"}' localhost:3000/api/games/
app.post('/api/games/', isAuthenticated, function (req, res, next) {
    // TODO: sanitize
    var title = req.body.title;
    var host = req.session.username;

    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

        dbo.collection("games").insertOne({title:title, host: host, inLobby: true, numPlayers:0, maxPlayers:MAXPLAYERS}, 
                function (err, game) {
            if (err) return res.status(500).end(err);
            return res.json(game.ops[0]);
        });
    });
});

// curl -b cookie.txt localhost:3000/api/games/
app.get('/api/games/', isAuthenticated, function (req, res, next) { 

    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

        //dbo.collection("games").drop();
        //dbo.collection("game_joined").drop();

        dbo.collection("games").find({inLobby:true}).toArray(function(err, games) {
            if (err) return res.status(500).end(" Server side error");
            return res.json(games);
        }); 
    });
});

// curl -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"username":"alice", "peerId": 123}' localhost:3000/api/games/5aad97f9f4e28b075083ef9c/joined/
app.post('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    // TODO: sanitize
    var user = req.session.username;
    var gameId = req.params.id;
    var userJoined = req.body.username;

    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

        dbo.collection("games").findOne({'_id': ObjectID(gameId)}, {}, function(err, game) {
            if (err) return res.status(500).end(err);
            if (!game) return res.status(409).end("game with id " + gameId + " not found");

            if (game.numPlayers >= game.maxPlayers) return res.status(409).end("game  " + gameId + " is full");
            if (game.host == userJoined) return res.status(409).end("User  " + userJoined + " is already the host");

            
            // CHECK IF GAME HAS TIMED OUT? 
            dbo.collection("game_joined").findOne({user:userJoined}, function(err, existingUser) { 
                if (err) return res.status(500).end(err);
                if (existingUser) return res.status(409).end("user" + userJoined + " is already in a game");

                dbo.collection("game_joined").insertOne({user:userJoined, game:gameId, points:0, wins:0}, function (err, userEntry) {
                        if (err) return res.status(500).end(err);
                        return res.json(userEntry[0]);
                });
            });
            
        });
    });
});




app.post('/api/images/', isAuthenticated, upload.single('file'), function (req, res, next) {
    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

        dbo.collection("game_joined").insert(new ImageData(req), function (err, image) {       
            if (err) return res.status(500).end(" Server side error");
            return res.json(new Image(image));
        });

    });
});

// Start game when number of players is greater than 1, and can only be started by host
// LOOK INTO long polling, and start a timer, where wud timer go?
app.get('/api/games/:id', isAuthenticated, function (req, res, next) {
    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);
    });
});

// JOINED clients in 
app.get('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    
    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

    });
});

// KICK player themself
app.patch('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {

    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName);

    });
});
/*
// curl -b cookie.txt localhost:3000/api/games/
app.get('api/games/', isAuthenticated, function (req, res, next) {    
    user = req.session.username;
    MongoClient.connect(uri, function(err, db) {  
        if (err) return res.status(500).end(err);
        var dbo = db.db(dbName); 

    });
});
*/

http.createServer(app).listen(process.env.PORT || PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});       

//game_instance = {ownerid, password, teamIds, }
//teamIds = {teamId, Userids=[]}
//userIds = {userid, hash, imagIds=[]}
//imageIds = 
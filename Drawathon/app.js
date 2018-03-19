"use strict"
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

const uri = "mongodb://admin:hashedpass@art-shard-00-00-xs19d.mongodb.net:" +
     "27017,art-shard-00-01-xs19d.mongodb.net:27017,art-shard-00-02-xs19d.mongodb.net" + 
     ":27017/test?ssl=true&replicaSet=Art-shard-0&authSource=admin";
const dbName = 'test';

var db = null;
var dbo;

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
    var cookies = cookie.parse(req.headers.cookie || '');
    req.user = ('user' in req.session)? req.session.user : null;
    var username = (req.session.username)? req.session.username : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
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
    //if (!req.session.username) return res.status(401).end("access denied");
    next();
};

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
app.post('/signup/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    
    connect(res, function(err, dbo, db) {
        if (err) return res.status(500).end(err);
        if (!dbo) return res.status(500).end("dbo err");
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
    connect(res, function(err, dbo, db) {
        if (err) return res.status(500).end(err);
        // retrieve user from the database
        dbo.collection("users").findOne({_id: username}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (!user) return res.status(401).end("Access denied, incorrect credentials\n");
            if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("Access denied, incorrect credentials\n"); 
            req.session.username = username;
            // initialize cookie
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
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
    res.json("User signed out");
});

// curl -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"title":"join THIS Lobby lol", "team1Id":123, "team2Id":123}' localhost:3000/api/games/
app.post('/api/games/', isAuthenticated, function (req, res, next) {
    // TODO: sanitize
    var title = req.body.title;
    var team1Id = req.body.team1Id;
    var team2Id = req.body.team2Id;
    var host = req.session.username;

    connect(res, function(err, dbo, db) {
        if (err) return res.status(500).end(err);

        dbo.collection("games").insertOne({title:title, host: host, team1Id:team1Id, 
            team2Id:team2Id, inLobby: true, numPlayers:0, maxPlayers:MAXPLAYERS},
            function (err, game) {
                if (err) return res.status(500).end(err);
                return res.json(game.ops[0]);
        });
    });
});

// curl -b cookie.txt localhost:3000/api/games/
app.get('/api/games/', isAuthenticated, function (req, res, next) { 
    connect(res, function(err, dbo, db) {
        if (err) return res.status(500).end(err);        

        dbo.collection("games").find({}).toArray(function(err, games) {
            if (err) return res.status(500).end(" Server side error");
            return res.json(games);
        });
    });
});

// curl -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"canvasId": 123, "chatId": 123}' localhost:3000/api/games/5aad97f9f4e28b075083ef9c/joined/
app.post('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    // TODO: sanitize
    var canvasId = req.body.canvasId;
    var chatId = req.body.chatId;
    var userJoined = req.session.username;
    var gameId = req.params.id;

    findGames(res, ObjectID(gameId), function(err, game, dbo, db) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.numPlayers >= game.maxPlayers) return res.status(409).end("game  " + gameId + " is full");
        if (game.host == userJoined) 
            return res.status(409).end("Joining user " + userJoined + " is already the host");

            dbo.collection('games').aggregate([
            {$lookup:{
                from: 'gameId',
                localField: '_id',
                foreignField: 'gameId',
                as: "game_join_info"
             }}]).toArray(function(err, gamesJoined) {    
            if (err) return res.status(500).end(" Server side error");            
            
            var gameJoined = gamesJoined[0];
            var usersJoined = gameJoined.game_join_info;
            var teamNum = 0;
            
            if (usersJoined.length > 0) teamNum = team(usersJoined);       
            var players = parseInt(game.numPlayers) + 1;

            // CHECK if user is in the game
            dbo.collection("games").update(
                {_id: ObjectID(gameId)},{$set: {"numPlayers": players} }, { "new": true}, function(err, wrRes){
                    if (err) return res.status(500).end(err);

                dbo.collection("game_joined").insertOne(
                    {user:userJoined, gameId:gameId, points:0, wins:0, teamNum:teamNum, canvasId:canvasId, chatId:chatId}, 
                    function (err, userEntry) {
                        if (err) return res.status(500).end(err);
                        return res.json(userEntry.ops[0]);
                });
            });
        });     
    });
});


// curl -b cookie.txt -H "Content-Type: application/json" -X DELETE localhost:3000/api/games/5aad97f9f4e28b075083ef9c/
app.delete('/api/games/:id/', isAuthenticated, function (req, res, next) {
    var host = req.session.username;
    var gameId = req.params.id;

    findGames(res, ObjectID(gameId), function(err, game, dbo, db) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== host) 
            return res.status(409).end("User " + host + " is not the host");

        dbo.collection("games").deleteOne({_id: ObjectID(gameId), host: host}, function(err, wrRes) {
            if (err) return res.status(500).end(err);
            if (wrRes.deletedCount === 0) return res.status(409).end("User " + host + " was not deleted");
            return res.json("Game " + game.title + " has been removed");
        });
    });    
});

// curl -b cookie.txt -H -X POST localhost:3000/api/games/5aae9368eccb1357c708bbd0/joined/
// KICK player themself
app.delete('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    //TODO Sanitize
    var gameId = req.params.id;
    var userLeave = req.session.username;

    connect(res, function(err, dbo, db) {
        if (err) callback(err, dbo, db);
        dbo.collection("game_joined").deleteOne({gameId: gameId, user: userLeave}, function(err, wrRes) {
            if (err) return res.status(500).end(err);
            if (wrRes.deletedCount == 0) return res.status(409).end("User " + userLeave + " is not in the game!");

            dbo.collection("games").findAndModify({_id: ObjectID(gameId)},
            [],
            {"$inc":{ "numPlayers": -1 }},  function(err, upRes) {
                if (err) return res.status(500).end(err);
                if (!(upRes.value)) return res.status(409).end("User " + userLeave + " is not in the game!");
                return res.json("user " + userLeave + " has been removed from game " + gameId);
            });
        });
    });
});

// curl -b cookie.txt localhost:3000/api/games/5aaee8a6a459c0149b14c809/joined
/* Returns every player entry for that game */ 
app.get('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    var gameId = req.params.id;
    var host = req.session.username;         

    connect(res, function(err, dbo, db) {
        if (err) return res.status(500).end(err);        
        findGames(res, ObjectID(gameId), function(err, game, dbo, db) {
            if (err) return res.status(500).end(err);
            if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
            
            dbo.collection("game_joined").find({gameId:  gameId}).toArray(function(err, games) {
                if (err) return res.status(500).end(err);
                return res.json(games);
            });
        });
    });
});


app.post('/api/images/', isAuthenticated, upload.single('file'), function (req, res, next) {
    connect(res, function(err, dbo, db) {
        if (err) return res.status(500).end(err);

        dbo.collection().insert(new ImageData(req), function (err, image) {       
            if (err) return res.status(500).end(" Server side error");
            return res.json(new Image(image));
        });
    });
});

app.get('/api/images/:id/image/', isAuthenticated, function (req, res, next) {
    var imageId = req.params.id; 
    images.findOne({_id: imageId}, function(err, image){
        if (err) return res.status(500).end(" Server side error");
        if (image === null) return res.status(404).end(" image id #" + imageId + " does not exists");
        var profile = image.picture;
        res.setHeader('Content-Type', profile.mimetype);
        res.sendFile(profile.path);        
    });
});

function team(userEnt) {
    var team0 = 0;
    var team2 = 0;    
    for (i = 0; i < userEnt.length; i++) { 
        if ((userEnt[i]).teamNum === team1) {
            team0++;
        } else {
            team1++;
        }
    }
    if (team1 < team0) return 1;
    return 0;
}

function findGames(res, gameId, callback) {
    connect(res, function(err, dbo, db) {
        if (err) callback(err, null, dbo, db);
        else {
            dbo.collection("games").findOne({_id: gameId}, function(err, game) {
                callback(err, game, dbo, db);
            });  
        }          
    });
}

function connect(res, callback) {
    callback(null, dbo, db);
}

http.createServer(app).listen(process.env.PORT || PORT, function (err) {
    if (err) console.log(err);
    else {
        MongoClient.connect(uri, function(err, mongodb) {  
            if (err) throw err;
            else {
                db = mongodb;
                dbo = db.db(dbName);
            }        
        });
        console.log("HTTP server on http://localhost:%s", PORT);
    }
        
        
});       

/*
MongoClient.connect(uri, function(err, db) {  
    if (err) return res.status(500).end(err);
    
    console.log("REMOVING!");
    //dbo.collection("users").drop();
    dbo.collection("games").drop();
    dbo.collection("game_joined").drop();
});
*/

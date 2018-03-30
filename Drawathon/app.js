"use strict"
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookie = require('cookie');
const session = require('express-session');
const crypto = require('crypto');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;

var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );

const passport = require('passport');
const google = require('googleapis');
const configFile = require('./config');

const validator = require('validator');
const expValidator = require('express-validator');
const checker = require('express-validator/check');
const sanitize = require('express-validator/filter');

var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitchStrategy = require("passport-twitch").Strategy;

var db = null;
var dbo = null;

const app = express();
const https = require('https');
const http = require('http');

const PORT = 3000;
const MAXPLAYERS = 4;
var multer  = require('multer');
var upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(expValidator())
app.use(bodyParser.json());
app.use(express.static('dist'));

var config = {key: privateKey, cert: certificate};

/* Twitch Strategy */
passport.use('twitchToken', new TwitchStrategy({
    clientID: configFile.twitch.clientid,
    clientSecret: configFile.twitch.clientSecret,
    callbackURL: configFile.twitch.Callback,
    scope: "user_read"
  },
  function(accessToken, refreshToken, profile, callback) {
    
    dbo.collection("users").findOne({twitchId: profile.id}, function(err, foundUser) {
        if (err) return callback(err, null);
        if (foundUser) return callback(null, foundUser);
        
        dbo.collection("users").insertOne(
        {twitchId: profile.id, username: profile.displayName, authProvider: 'twitch'},
        function (err, res) {
            if (err) return callback(err, null);
            return callback(null, res.ops[0]);
        });
    });
  }
)); 

/*
 Google OUATH Strategy, once 'authenticated', user will be directed to google's authentication page, then a user's
    profile is returned which we process and send back to a callback function
    All frontend needs to do is call '/users/oauth/google/', and check
    appropriate profile set in session.
*/
passport.use('googleToken', new GoogleStrategy({ 
        clientID: configFile.google.clientid,
        clientSecret: configFile.google.clientSecret,
        callbackURL: configFile.google.Callback,
    }, function(accessToken, refreshToken, profile, callback) {

        dbo.collection("users").findOne({googleId: profile.id}, function(err, foundUser) {
            if (err) return callback(err, null);
            if (foundUser) return callback(null, foundUser);
            dbo.collection("users").insertOne(
            {googleId: profile.id, username: profile.displayName, authProvider: 'google'},
            function (err, res) {
                if (err) return callback(err, null);
                return callback(null, res.ops[0]);
            });
        });
    }
));


passport.use('facebookToken', new FacebookStrategy({
    clientID: configFile.facebook.appid, 
    clientSecret: configFile.facebook.clientSecret,
    callbackURL: configFile.facebook.Callback,
    enableProof: true
  }, function(accessToken, refreshToken, profile, callback) {
    
    dbo.collection("users").findOne({facebookId: profile.id}, function(err, foundUser) {
        if (err) return callback(err, null);
        if (foundUser) return callback(null, foundUser);
        dbo.collection("users").insertOne(
            {facebookId: profile.id, username: profile.displayName, authProvider: 'facebook'},     
            function (err, res) {
                if (err) return callback(err, null);
                return callback(null, res.ops[0]);
            });
        });
    }
));

/* Serialization for passport to save users into session, called by passport in request flow,
stored in req.session.passport.user and deserialized to req.user if success 
*/
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    dbo.collection("users").findOne({_id: ObjectId(id)}, function(err, user) {
        return done(err, user);
    });    
});

app.use(session({
    cookie: {
        httpOnly: true
        ,secure: true
        ,sameSite: true
    },
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.use(passport.initialize());
app.use(passport.session());

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
    var authUser = (req.user)? req.user.username : '';
    var username = (req.session.username)? req.session.username : authUser;

    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
        httpOnly: false,
        secure: true,
        sameSite: true,
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});

var isAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated() && !req.session.username) return res.status(401).end("access denied");
    next();
};

var checkUsername = function(req, res, next) {
    req.checkBody('username', 'Username is required').exists().notEmpty();
    req.checkBody('username', 'Please enter a valid alphanumeric username').isAlphanumeric();
    next();
};

var checkPassword = function(req, res, next) {
    req.checkBody('password', 'Password is required').exists().notEmpty();
    next();
};

/* uses passport auth to direct appropriately, afterwards callback get is called
and further redirected to homepage, after req.session.passport.user is set */
app.get('/users/oauth/google/', passport.authenticate('googleToken', {scope:[ 'profile']}));

app.get('/users/oauth/facebook/', passport.authenticate('facebookToken', {scope:[ 'public_profile']}));

app.get('/users/oauth/twitch/', passport.authenticate('twitchToken'));

app.get('/users/oauth/twitch/callback', 
  passport.authenticate('twitchToken', { failureRedirect: '/signin/'}),
  function(req, res) {

    req.session.username = req.user.username;
    req.session.authProv = 'twitch';
    res.setHeader('Set-Cookie', cookie.serialize('username', req.session.username, {
        sameSite: true,
        secure: true,
        httpOnly: false,
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 
    }));

    return res.redirect('/');    
});

app.get('/users/oauth/facebook/callback', 
  passport.authenticate('facebookToken', { failureRedirect: '/signin/'}),
  function(req, res) {
    req.session.username = req.user.username;
    req.session.authProv = 'facebook';
    res.setHeader('Set-Cookie', cookie.serialize('username', req.session.username, {
        sameSite: true,
        secure: true,
        httpOnly: false,
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 
    }));
    return res.redirect('/');    
});

app.get('/users/oauth/google/callback', 
  passport.authenticate('googleToken', { failureRedirect: '/signin/'}),
  function(req, res) {
    req.session.username = req.user.givName;
    req.session.authProv = 'google';
    res.setHeader('Set-Cookie', cookie.serialize('username', req.session.username, {
        sameSite: true,
        secure: true,
        httpOnly: false,
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    return res.redirect('/');    
  });

// curl -k -H  "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt https://localhost:3000/signup/
app.post('/signup/', [checkUsername, checkPassword],  function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    dbo.collection("users").findOne({username: username, authProvider: 'artemis'}, function(err, user) {
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("Username " + username + " already exists");

        var salt = generateSalt();
        var hash = generateHash(password, salt);
        dbo.collection("users").update({username: username, authProvider: 'artemis'}, 
            {username: username, authProvider: 'artemis', salt:salt, hash:hash}, 
            {upsert: true}, function(n, nMod) {
                if (err) return res.status(500).end(err);
                return res.json("User " + username + " signed up");
        });
    });
});

// curl -k -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt https://localhost:3000/signin/
// curl -k -H "Content-Type: application/json" -X POST -d '{"username":"bob","password":"alice"}' -c cookie.txt https://localhost:3000/signin/
app.post('/signin/', [checkUsername, checkPassword], function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    dbo.collection("users").findOne({username: username, authProvider: 'artemis'}, function(err, user) {
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("Access denied, incorrect credentials\n");
        if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("Access denied, incorrect credentials\n"); 

        req.session.username = username;
        req.session.authProv = 'artemis';
        // initialize cookie
        res.setHeader('Set-Cookie', cookie.serialize('username', username, {
            sameSite: true,
            secure: true,
            httpOnly: false,
            path : '/', 
            maxAge: 60 * 60 * 24 * 7
        }));
        return res.json("User " + username + " signed in");
    });
});

// Sign out of the current user
app.get('/signout/', function (req, res, next) {
    req.logOut();
    req.session.destroy();    
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 
    }));
    res.json("User signed out");
});

// curl -k  -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"title":"join THIS Lobby lol", "team1Id":123, "team2Id":123}' https://localhost:3000/api/games/
app.post('/api/games/', isAuthenticated, function (req, res, next) {
    req.checkBody('title', 'Every game needs a title!').exists().notEmpty();
    //req.checkBody('team1Id', "Each game requires valid teamIds").exists().notEmpty();
    //req.checkBody('team2Id', "Each game requires valid teamIds").exists().notEmpty();
    
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var title = req.body.title;
    var host = req.session.username;
    var provider = req.session.authProv;    
    var team1Id = req.body.team1Id;
    var team2Id = req.body.team2Id;

    // Check if game has already been created
    dbo.collection("games").findOne({host: host, authProvider:provider}, function(err, game) {
        if (err) return res.status(500).end(err);
        if (game) return res.status(409).end("User " + host + " already has a hosted game");
        
        dbo.collection('games').insertOne({title:title, host: host, authProvider:provider, team1Id:team1Id, 
            team2Id:team2Id, inLobby: true, numPlayers:0, maxPlayers:MAXPLAYERS},
            function (err, game) {
                if (err) return res.status(500).end(err);
                return res.json(game.ops[0]);
        });
    });
});

// curl -k -b cookie.txt https://localhost:3000/api/games/
app.get('/api/games/', isAuthenticated, function (req, res, next) {
    dbo.collection("games").find({inLobby:true}).toArray(function(err, games) {
        if (err) return res.status(500).end(" Server side error");
        return res.json(games);
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"canvasId": 123, "chatId": 123}' https://localhost:3000/api/games/5aad97f9f4e28b075083ef9c/joined/
app.post('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var userJoined = req.session.username;
    var provider = req.session.authProv;
    var canvasId = req.body.canvasId;
    var chatId = req.body.chatId;
    var gameId = req.params.id;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.numPlayers >= game.maxPlayers) return res.status(409).end("game  " + gameId + " is full");
        if ((game.host === userJoined) && (game.authProvider === provider))
            return res.status(409).end("Joining user " + userJoined + " is already the host");

            dbo.collection('games').aggregate([
            {$match: {_id: ObjectId(gameId)}},
            {$lookup:{
                from: 'game_joined',
                localField: '_id',
                foreignField: 'gameId',
                as: "game_join_info"
             }}/*,{$unwind: {path: "$game_join_info",preserveNullAndEmptyArrays: true }}*/
            ]).toArray(function(err, gamesJoined) {
            if (err) return res.status(500).end(err);
            var gameJoined = gamesJoined[0];
            var teamNum;
            
            team(gameJoined.game_join_info, userJoined, provider, function(err, num) {
                if (err) return res.status(409).end(err);
                var teamNum = num;                
                var players = parseInt(game.numPlayers) + 1;
            
                dbo.collection("games").update(
                    {_id: ObjectId(gameId)},{$set: {"numPlayers": players} }, { "new": true}, function(err, wrRes){
                        if (err) return res.status(500).end(err);
    
                    dbo.collection("game_joined").insertOne(
                        {user:userJoined, authProvider:provider, gameId:ObjectId(gameId), points:0, wins:0, teamNum:teamNum, canvasId:canvasId, chatId:chatId}, 
                        function (err, userEntry) {
                            if (err) return res.status(500).end(err);
                            return res.json(userEntry.ops[0]);
                    });
                });
            });
        });     
    });
});

app.get('/api/games/:id/', isAuthenticated, function (req, res, next) {
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);
    var gameId = req.params.id;
    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        return res.json(game);
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X PATCH -d '{"team1Id": 1233, "team2Id": 12123}' https://localhost:3000/api/games/5aad97f9f4e28b075083ef9c/host/
app.patch('/api/games/:id/host/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    req.checkBody('team1Id', "Host requires a canvas id for team 1").exists().notEmpty();
    req.checkBody('team2Id', "Host requires a canvas id for team 2").exists().notEmpty();

    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var gameId = req.params.id;
    var poster = req.session.username;
    var provider = req.session.authProv;
    var team1Id = req.body.team1Id;
    var team2Id = req.body.team2Id;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== poster || game.authProvider !== provider) 
            return res.status(409).end("User " + poster + " is not the host of this game");

        dbo.collection("games").updateOne(
            {_id: ObjectId(gameId)},{$set: {"team1Id": team1Id,"team2Id": team2Id}}, { "new": true}, function(err, wrRes){
                if (err) return res.status(500).end(err);
                return res.json("Canvas ids posted");
        });
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X PATCH -d '{"canvasId": "123123", "chatId": "12412sdad"}' https://localhost:3000/api/games/5abd897b49790f305b870aab/joined/
app.patch('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    req.checkBody('chatId', "Each player requires a chat id").exists().notEmpty();
    req.checkBody('canvasId', "Each player requires a canvas id").exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var gameId = req.params.id;
    var joinedUser = req.session.username;
    var provider = req.session.authProv;    
    var chatId = req.body.chatId;
    var canvasId = req.body.canvasId;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 

        dbo.collection("game_joined").findOne({gameId:ObjectId(gameId), user:joinedUser, authProvider:provider},  function(err, gameJoined) {
            if (err) return res.status(500).end(" Server side error");
            if (!gameJoined) return res.status(409).end("User " + joinedUser + " not found"); 

            dbo.collection("game_joined").updateOne(
                {gameId: ObjectId(gameId), user:joinedUser, authProvider:provider},
                {$set: {"chatId": chatId,"canvasId": canvasId}}, { "new": true}, function(err, wrRes){
                    if (err) return res.status(500).end(err);
                    return res.json("Peer ids posted");
            });

        });
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X DELETE https://localhost:3000/api/games/5aad97f9f4e28b075083ef9c/
app.delete('/api/games/:id/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var host = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.id;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== host || game.authProvider !== provider) 
            return res.status(409).end("User " + host + " is not the host of this game");

        dbo.collection("games").deleteOne({_id: ObjectId(gameId), host:host, authProvider:provider}, function(err, wrRes) {
            if (err) return res.status(500).end(err);
            if (wrRes.deletedCount === 0) return res.status(409).end("User " + host + " was not deleted");
            return res.json("Game " + game.title + " has been removed");
        });
    });    
});

// curl -k -b cookie.txt -H -X delete  https://localhost:3000/api/games/5aae9368eccb1357c708bbd0/joined/
// KICK player themself
app.delete('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var userLeave = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.id;   
    dbo.collection("game_joined").deleteOne({gameId: ObjectId(gameId), user: userLeave, authProvider:provider}, function(err, wrRes) {
        if (err) return res.status(500).end(err);
        if (wrRes.deletedCount == 0) return res.status(409).end("User " + userLeave + " is not in the game!");

        dbo.collection("games").findAndModify({_id: ObjectId(gameId)},
        [],
        {"$inc":{ "numPlayers": -1 }},  function(err, upRes) {
            if (err) return res.status(500).end(err);
            if (!(upRes.value)) return res.status(409).end("User " + userLeave + " is not in the game!");
            return res.json("user " + userLeave + " has been removed from game " + gameId);
        });
    });
});

// curl -k -b cookie.txt -H -X delete https://localhost:3000/api/games/5aae9368eccb1357c708bbd0/joined/alice
/* Allow host to kick a play from the game */
app.delete('/api/games/:gameId/joined/:username', isAuthenticated, function (req, res, next) {
    req.checkParams('gameId', 'game id required!').exists().notEmpty();
    req.checkParams('username', 'username required!').exists().notEmpty();

    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var host = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.gameId; 
    var playerKick = req.params.username;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== host || game.authProvider !== provider) 
            return res.status(409).end("User " + host + " is not the host of this game");

        dbo.collection("game_joined").deleteOne({gameId: ObjectId(gameId), user: playerKick, authProvider:provider}, function(err, wrRes) {
            if (err) return res.status(500).end(err);
            if (wrRes.deletedCount == 0) return res.status(409).end("User " + playerKick + " is not in the game!");

            dbo.collection("games").findAndModify({_id: ObjectId(gameId)}, [], 
            {"$inc":{ "numPlayers": -1 }},  function(err, upRes) {
                if (err) return res.status(500).end(err);
                if (!(upRes.value)) return res.status(409).end(" number of players could not be reduced ingame");
                return res.json("user " + playerKick + " has been removed from game " + gameId);

            });
        });
    });
})
// curl -k -b cookie.txt https://localhost:3000/api/games/5aaee8a6a459c0149b14c809/joined
/* Returns every player entry for that game */ 
app.get('/api/games/:id/joined/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);
    var gameId = req.params.id;
        
    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(err);
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        
        dbo.collection("game_joined").find({gameId: ObjectId(gameId)}).toArray(function(err, games) {
            if (err) return res.status(500).end(err);
            return res.json(games);
        });
    });
});

// curl -k -b cookie.txt -X POST 'https://localhost:3000/api/games/5abd3cf22b3db66bcc0e2ef9/image/' -H 'content-type: multipart/form-data' -F 'file=@/home/shadman/ARTemis/Drawathon/uploads/user.png'
// 'file=@/home/shadman/ARTemis/Drawathon/uploads/user.png'
app.post('/api/games/:id/image/', isAuthenticated, upload.single('file'), function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var gameId = req.params.id;
    var poster = req.session.username;
    var provider = req.session.authProv;
    var file = req.file;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== poster || game.authProvider !== provider) 
            return res.status(409).end("User " + poster + " is not the host of this game");

        dbo.collection("images").findOne({gameId: gameId} ,function(err, image) {
            if (err) return res.status(500).end("Server side error");
            if (image) return res.status(409).end("Game " + gameId + " already has a posted image");            

            dbo.collection("images").insertOne({gameId:gameId, file:file}, function (err, image) {       
                if (err) return res.status(500).end(" Server side error");
                return res.json(image.ops[0]);
            });
        });
    });
});

// curl -k -b cookie.txt 'https://localhost:3000/api/games/5abd3cf22b3db66bcc0e2ef9/image/'
app.get('/api/games/:id/image/', isAuthenticated, function (req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var gameId = req.params.id;

    dbo.collection("images").findOne({gameId: gameId}, function(err, image){
        if (err) return res.status(500).end(" Server side error");
        if (image == null) return res.status(409).end(" game id " + gameId + " does not have an image");

        var profile = image.file;
        res.setHeader('Content-Type', profile.mimetype);
        res.sendFile(profile.path);        
    });
});

function team(userEnt, userJoined, provider, callback) {
    var team0 = 0;
    var team1 = 0;
    var i = 0;
    var user;
    for (i; i < userEnt.length; i++) {
        user = (userEnt[i]);
        if (user.user === userJoined && user.authProvider === provider) 
            return callback("user is already in the game", null);
        
        if (user.teamNum === 1) team1++;
        else team0++;
    }
    if (team1 < team0) return callback(null, 1);
    return callback(null, 0);
}

function findGames(res, gameId, callback) {
    dbo.collection("games").findOne({_id: ObjectId(gameId)}, function(err, game) {
        callback(err, game);
    }) 
};

async function mongoSetup() {
    await MongoClient.connect(configFile.mongo.id, function(err, mongodb) {  
        if (err) console.log(err);
        if (!mongodb) console.log(err);
        else {
            db = mongodb;
            dbo = db.db(configFile.mongo.dbname);            
            //dbo.collection("games").drop();
            //dbo.collection("images").drop();            
            //dbo.collection("users").drop();            
            //dbo.collection("game_joined").drop();
        }        
    });
}
mongoSetup();


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


if (app.get('env') === 'development'){      
    https.createServer(config, app).listen(process.env.PORT || PORT, function (err) {
        if (err) console.log(err);
        else {
            console.log("HTTPS server on http://localhost:%s in %s mode", PORT, app.settings.env);
        }
    })
} else {
    http.createServer(app).listen(process.env.PORT || PORT, function (err) {
        if (err) console.log(err);
        else {
            console.log("HTTP server on http://localhost:%s in %s mode", PORT);
        }        
    })
}
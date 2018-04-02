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
var privateKey = fs.readFileSync( 'privkey.pem' );
var certificate = fs.readFileSync( 'fullchain.pem' );

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
var sync = require('synchronize')
var db = null;
var dbo = null;

const app = express();
const https = require('https');
const http = require('http');

const Clarifai = require('clarifai');

var appC = new Clarifai.App({apiKey:'b7d7c87a413f4343a71acb1de57af30d'})

const PORT = 3000;
const MAXPLAYERS = 4;
var multer  = require('multer');
var upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(expValidator())
app.use(bodyParser.json());

// The following forceSSL middleware code snippet is taken from 
/** https://medium.com/@ryanchenkie_40935/angular-cli-deployment-host-your-angular-2-app-on-heroku-3f266f13f352 */

/** If an incoming request uses a protocol other than HTTPS, redirect that request to the
    same url but with HTTPS **/
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
  
// Instruct the app to use the forceSSL middleware
if (app.get('env') !== 'development'){
    app.use(forceSSL());
}

app.use(express.static('dist'));

var config = {key: privateKey, cert: certificate};

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
        {twitchId: profile.id, username: profile.displayName, 
            authProvider:'twitch', wins: 0, losses: 0},
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
            {googleId: profile.id, username: profile.displayName,
                authProvider: 'google', wins: 0, losses: 0},
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
            {facebookId: profile.id, username: profile.displayName, 
                authProvider: 'facebook', wins: 0, losses: 0},     
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

app.enable('trust proxy');
app.use(session({
    proxy: true,
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
    req.checkBody('username', 'Username must be atleast 5 characters ').isLength({min:5});
    req.checkBody('username', 'Username must be atmost 24 characters long').isLength({max: 24});
    next();
};

var checkPassword = function(req, res, next) {
    req.checkBody('password', 'Password is required').exists().notEmpty();
    req.checkBody('password', 'Password must be atleast 5 characters ').isLength({min:5});
    req.checkBody('password', 'Password must be atmost 40 characters long').isLength({max: 40});
    next();
};

var checkGameId = function(req, res, next) {
    req.checkParams('id', 'game id required!').exists().notEmpty();
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
    req.session.username = req.user.username;
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

// Used for certificate verification
/**app.get('/.well-known/acme-challenge/:content', function(req, res) {
  res.send('z6F4TXhOLDXyguD1xFva13F_SXvyszCsGCK59B7s2gg.OMGwzW84iLXhz8or4-maUCjxxqKwPDyXVInqvV-l3jA')
})**/

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
            {username: username, authProvider: 'artemis', salt:salt, hash:hash, wins: 0, losses: 0}, 
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

        dbo.collection("users").update({username: username, authProvider: 'artemis'},
        {$set: {lastAccess: new Date()}}, function(err, user) {
            return res.json("User " + username + " signed in");
        });        
    });
});

// Sign out of the current user
app.get('/signout/', isAuthenticated, function (req, res, next) {

    var host = req.session.username;
    var provider = req.session.authProv;
    req.logOut();
    req.session.destroy();    
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 
    }));

    // Check if game has already been created
    dbo.collection("games").deleteOne({host: host, authProvider:provider}, function(err, wrRes) {
        if (err) return res.status(500).end(err);
        return res.json("User signed out");
    });
});

// curl -k  -b cookie.txt -H "Content-Type: application/json" -X POST -d '{"title":"join THIS Lobby lol"}' https://localhost:3000/api/games/
/* Creates a game lobby */
app.post('/api/games/', isAuthenticated, function (req, res, next) {
    req.checkBody('title', 'Every game needs a title!').exists().notEmpty();

    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var title = req.body.title;
    var host = req.session.username;
    var provider = req.session.authProv;    

    // Check if game has already been created
    dbo.collection("games").findOne({host: host, authProvider:provider}, function(err, game) {
        if (err) return res.status(500).end(err);
        if (game) return res.status(409).end("User " + host + " already has a hosted game");
        
        dbo.collection('games').insertOne(
            {title:title,  host: host, authProvider:provider,
            inLobby: true, numPlayers:0, maxPlayers:MAXPLAYERS},
            function (err, game) {
                if (err) return res.status(500).end(err);
                return res.json(game.ops[0]);
        });
    });
});

// curl -k -b cookie.txt https://localhost:3000/api/games/
/* Gets all lobby games */
app.get('/api/games/', isAuthenticated, function (req, res, next) {
    dbo.collection("games").find({inLobby:true}).toArray(function(err, games) {
        if (err) return res.status(500).end(" Server side error");
        return res.json(games);
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X POST  https://localhost:3000/api/games/5aad97f9f4e28b075083ef9c/joined/
/* Join a game  */
app.post('/api/games/:id/joined/', [isAuthenticated, checkGameId], function (req, res, next) {
    
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var userJoined = req.session.username;
    var provider = req.session.authProv;
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
             }}
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
                        {user:userJoined, authProvider:provider, gameId:ObjectId(gameId), winner:false, teamNum:teamNum},
                        function (err, userEntry) {
                            if (err) return res.status(500).end(err);
                            return res.json(userEntry.ops[0]);
                    });
                });
            });
        });     
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X PATCH -d '{"action": "Start", "time": 120}' https://localhost:3000/api/games/5abffc298dd2d4558f58e312/
// curl -k -b cookie.txt -H "Content-Type: application/json" -X PATCH -d '{"action": "End", "teamNum": 0}' https://localhost:3000/api/games/5abffc298dd2d4558f58e312/
/* Starts a game given a time limit, Ends a game given a winner  */
app.patch('/api/games/:id/', [isAuthenticated, checkGameId], function (req, res, next) {
    req.checkBody('action', 'Valid Action required!').exists().notEmpty().isIn(['Start', 'End'])
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);
    var action = req.body.action;

    if (action === "Start")
        req.checkBody('time', 'Every game needs a time limit!').exists().notEmpty().isNumeric();
    
    if (action === "End") 
        req.checkBody('teamNum', 'Every game needs a valid winning team!').exists().notEmpty().isNumeric().isIn[0,1];
    
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);
    
    var time = req.body.time;
    var winner = req.body.teamNum;
    var endTime = new Date().getTime() + time;
    
    var host = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.id;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== host || game.authProvider !== provider)
            return res.status(409).end("User " + host + " is not the host of this game");
        if (game.numPlayers < 2) return res.status(409).end("game with id" + gameId + " has less than 2 joined players");

        if (action == "Start") {
            if (!game.inLobby && action) return res.status(409).end("game with id" + gameId + " has already started"); 
            dbo.collection("games").updateOne({_id: ObjectId(gameId)},
            {$set: {inLobby: false, endTime: endTime}},  {"new": true}, function(err, wrRes){
                if (err) return res.status(500).end(err);
                if (wrRes.modifiedCount = 0) return res.status(409).end("game with id" + gameId + " could not be modified"); 
                return res.json("Game started!");
            });
        } else {

            dbo.collection("game_joined").updateMany({gameId: ObjectId(gameId), teamNum: winner}, 
            {$set: {"winner": true}},               
            function(err, wrRes) {
                if (err) return res.status(500).end(err);
                if (wrRes.modifiedCount == 0) return res.status(409).end("players for game " + gameId + " have already been assigned winners"); 
                
                dbo.collection("game_joined").find({gameId: ObjectId(gameId) }).toArray(function(err, playerEntries) {
                    if (err) return res.status(500).end(" Server side error");
                    updateWinnersLosers(playerEntries, function(err, result) {
                        if (err) return res.status(500).end(err);
                        return res.json("Game Ends!!");
                    });
                });
                
            });
        }
    });
});




function updateWinnersLosers(playerEntries, callback) {

    var winners = playerEntries.reduce(function(filtered, user) {
        if (user.winner) filtered.push(
             {user:user.user, authProvider:user.authProvider}
        );
        return filtered;
    }, []);

    var losers = playerEntries.reduce(function(filtered, user) {
        if (!user.winner) filtered.push(
            {user:user.user, authProvider:user.authProvider}
        );
        return filtered;
    }, []); 
    updateUsers(winners, losers, callback);
}
async function updateUsers(winners, losers, callback) {
    var allDone = winners.length + losers.length
    var count = 0;
    for (var i = 0; i < (winners).length; i++){ 
        (function(user, authProvider){ 
            dbo.collection("users").update({username:user, authProvider:authProvider},  
                {"$inc":{ wins:1 }}, function(err, data) {
                if (err) return callback(err, null);
                count++
                if (count >= allDone) callback(null, data)
            });
        } (winners[i].user,winners[i].authProvider));
    };

    for (var i = 0; i < (losers).length; i++){ 
        (function(user, authProvider){ 
            dbo.collection("users").update({username:user, authProvider:authProvider},  
                {"$inc":{losses:1 }}, function(err, data) {
                if (err) return callback(err, null);
                count++
                if (count >= allDone) callback(null, data)
            });
        } (losers[i].user,losers[i].authProvider));
    };
}


// curl -k -b cookie.txt https://localhost:3000/api/games/5abd897b49790f305b870aab
/* Gets game specific information */
app.get('/api/games/:id/', [isAuthenticated, checkGameId], function (req, res, next) {
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);
    var gameId = req.params.id;
    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        return res.json(game);
    });
});


app.get('/api/games/:auth/:user/playerstats/', isAuthenticated, function (req, res, next) {
    req.checkParams('auth', 'username required!').exists().notEmpty();
    req.checkParams('auth', 'authentication provider required!').exists().notEmpty();
    authProv = req.params.auth;
    user = req.params.user;

    dbo.collection("users").findOne({user:user, authProvider:authProv}).toArray(function(err, user) {
        if (err) return res.status(500).end(" Server side error");
            return {user: user.wins, losses: user.losses};
    });
});


// curl -k -b cookie.txt -H "Content-Type: application/json" -X PATCH -d '{"action":'generateId', 'team1Id": 1233, "team2Id": 12123}' https://localhost:3000/api/games/5aad97f9f4e28b075083ef9c/host/
/* Patch a host's rtc ids for each team */
app.patch('/api/games/:id/host/', [isAuthenticated, checkGameId], function (req, res, next) {
    req.checkBody('action', 'Valid Action required for patch!').exists().notEmpty().isIn(['generateId'])
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
/* Patch a players's rtc id n a game */
app.patch('/api/games/:id/joined/', [isAuthenticated, checkGameId], function (req, res, next) {
    req.checkBody('action', 'Valid Action required for patch!').exists().notEmpty().isIn(['generateId']);
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
                {gameId: ObjectId(gameId),  user:joinedUser, authProvider:provider},
                {$set: {"chatId": chatId,"canvasId": canvasId}}, {"new": true}, function(err, wrRes){
                    if (err) return res.status(500).end(err);
                    return res.json("Peer ids posted");
            });
        });
    });
});

// curl -k -b cookie.txt -H "Content-Type: application/json" -X DELETE https://localhost:3000/api/games/5aad97f9f4e28b075083ef9c/
/*  Allow a host to delete a game */
app.delete('/api/games/:id/', [isAuthenticated, checkGameId], function (req, res, next) {
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
            if (wrRes.deletedCount === 0) return res.status(409).end("game " + gameId + " was not deleted");

            dbo.collection("game_joined").deleteMany({gameId: ObjectId(gameId)}, function(err, delRes) {
                if (err) return res.status(500).end(err);
                if (delRes.deletedCount !== game.numPlayers) return res.status(409).end("game" + gameId + " lobby could not kick all players")
                //removeFromClarifai(gameId, function(err, resp) {
                //    if (err) return res.status(500).end(err)
                //    else console.log("Image removed from Clarifai")
                //});
                return res.json("Game " + game.title + " has been removed");
            });
        });
    });    
});

// curl -k -b cookie.txt -H -X delete  https://localhost:3000/api/games/5aae9368eccb1357c708bbd0/joined/
/* Leave the game as a player*/
app.delete('/api/games/:id/joined/', [isAuthenticated, checkGameId], function (req, res, next) {
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);


    var userLeave = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.id;
    dbo.collection("game_joined").deleteOne({gameId: ObjectId(gameId), user: userLeave, authProvider:provider}, function(err, wrRes) {
        if (err) return res.status(500).end(err);
        if (wrRes.deletedCount == 0) return res.status(409).end("User " + userLeave + " is not in the game!");

        dbo.collection("games").findAndModify({_id: ObjectId(gameId)}, [],
        {"$inc":{ "numPlayers": -1 }},  function(err, upRes) {
            if (err) return res.status(500).end(err);
            if (!(upRes.value)) return res.status(409).end("User " + userLeave + " is not in the game!");
            return res.json("user " + userLeave + " has been removed from game " + gameId);
        });
    });
});

// curl -k -b cookie.txt -H -X delete https://localhost:3000/api/games/5aae9368eccb1357c708bbd0/joined/alice
/* Allow host to kick a player from the game */
app.delete('/api/games/:id/joined/:userId/', [isAuthenticated, checkGameId], function (req, res, next) {
    var errors = req.validationErrors();
    if (errors) return res.status(400).send(errors[0].msg);

    var host = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.id; 
    var playerKick = req.params.userId;

    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        if (game.host !== host || game.authProvider !== provider) 
            return res.status(409).end("User " + host + " is not the host of this game");

        dbo.collection("game_joined").deleteOne({gameId: ObjectId(gameId), user:playerKick}, function(err, wrRes) {
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
app.get('/api/games/:id/joined/', [isAuthenticated, checkGameId], function (req, res, next) {
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


// Add image to clarifai's image collection
// Takes in image path of uploaded game picture and game ID
function addToClarifai (imagePath, gameID) {
    console.log("Image's path");
    console.log(imagePath);
    var data = fs.readFileSync(imagePath);
    appC.inputs.create({
        base64: data.toString('base64'),
        id: gameID
        }).then(
        function(response) {
            //console.log(response);
            console.log("Image uploaded to clarifai");
        },
        function(err) {
            console.log(err);
        }
      );
     
}


// Remove image from clarifai's image collection
function removeFromClarifai (gameID, callback){
    appC.inputs.delete(gameID).then(
        function(response) {
            return callback(null, response);
        },
        function(err) {
            return callback(err, null);
        }
      );
}

// Compare another image with the image for the game stored in Clarifai
// Takes in the base64 encoded string of users drawing and game ID of the image
app.post('/api/games/:id/canvas/', [isAuthenticated, checkGameId], function (req, res, next) {
    // Get curr username
    var host = req.session.username;
    var provider = req.session.authProv;
    var gameId = req.params.id;
    req.checkBody('img', 'Valid canvas base64 encoded string required!').exists().notEmpty()
    var canvasImg = req.body.img;
    // Check if host
    findGames(res, gameId, function(err, game) {
        if (err) return res.status(500).end(" Server side error");
        if (!game) return res.status(409).end("game with id " + gameId + " not found"); 
        //console.log("Host is " + host);
        //console.log("Host should be " + game.host);
        //console.log("Provider is " + provider);
        //console.log("Authprovider should be " + game.authProvider);
        if (game.host !== host || game.authProvider !== provider) 
            return res.status(409).end("User " + host + " is not the host of this game");
        // Get canvas similarity score
        appC.inputs.search({ input: {base64: canvasImg} }).then(
            function(response) {
                var score = 0;
                //console.log(response);
                //console.log(response);
                console.log("Calculated image similarity score");
                // Find the similarity for the image ID of this game, then return the score
                console.log(response.hits.length);
                for (var index = 0; index < response.hits.length; index++) {
                    //console.log("hit id is: " + response.hits[index].input.id);
                    //console.log("gameid is: " + gameId)
                    // Get the image with the current game's ID
                    if (response.hits[index].input.id == gameId) {
                        score = response.hits[index].score;
                        console.log("Similarity score is " + score)
                        return res.json(score);
                    } 
                }
                return res.json(score);
            },
            function(err) {
                console.log(err);
                return res.status(500).end(err);
            }
        );
    })
});

// curl -k -b cookie.txt -X POST 'https://localhost:3000/api/games/5abd3cf22b3db66bcc0e2ef9/image/' -H 'content-type: multipart/form-data' -F 'file=@/home/shadman/ARTemis/Drawathon/uploads/user.png'
// 'file=@/home/shadman/ARTemis/Drawathon/uploads/user.png'
app.post('/api/games/:id/image/', [isAuthenticated, checkGameId], upload.single('file'), function (req, res, next) {
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
                addToClarifai(file.path, gameId);
                return res.json(image.ops[0]);
            });
        });
    });
});

// curl -k -b cookie.txt 'https://localhost:3000/api/games/5abd3cf22b3db66bcc0e2ef9/image/'
app.get('/api/games/:id/image/', [isAuthenticated, checkGameId], function (req, res, next) {
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
// Redirects for our SPA program.
app.get('/signup', function (req, res, next){
    res.redirect('/');
});
app.get('/lobby', function (req, res, next){
    res.redirect('/');
});
app.get('/game', function (req, res, next){
    res.redirect('/');
});
app.get('/host', function (req, res, next){
    res.redirect('/');
});
app.get('/main', function (req, res, next){
    res.redirect('/');
});
app.get('/credit', function (req, res, next){
    res.redirect('/');
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
            
            /* dbo.collection("games").drop();
            dbo.collection("images").drop();            
            dbo.collection("users").drop();            
            dbo.collection("game_joined").drop();  */
            
            /*
            dbo.collection("users").find({username: "alice6"}).toArray(function(err, res) {
                console.log(res);
                res.map(x => console.log(x._id))
            });
            */
            
        }        
    });
}
mongoSetup();

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
            console.log("HTTP server on http://localhost:%s in %s mode", process.env.PORT);
        }        
    })
}
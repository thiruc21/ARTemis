var config = {};
const env = require('get-env')();
const crypto = require('crypto');

//mongo database
config.mongo = {};
config.mongo.id = "mongodb://admin:hashedpass@art-shard-00-00-xs19d.mongodb.net:" +
"27017,art-shard-00-01-xs19d.mongodb.net:27017,art-shard-00-02-xs19d.mongodb.net" + 
":27017/test?ssl=true&replicaSet=Art-shard-0&authSource=admin";
config.mongo.dbname = 'test';

config.google = {};
config.google.clientid = '599342492421-8mhu8ms52vk6l4knoiveumt23uef9e7i.apps.googleusercontent.com';
config.google.clientSecret = 'A-R_JDtyqlUg_kn-mbWxnXn-';


config.facebook = {};
config.facebook.appid = '967248243451565';
config.facebook.clientSecret = '3a20033839729f77f2f0fd569312116a';

if (env === 'dev') {
    config.google.Callback = 'https://localhost:3000/users/oauth/google/callback'   
    config.facebook.Callback =  'https://localhost:3000/users/oauth/facebook/callback'
} else {
    config.google.Callback = 'https://art-emis.herokuapp.com/users/oauth/google/callback'
    config.facebook.Callback =  'https://art-emis.herokuapp.com/users/oauth/facebook/callback'
}

module.exports = config;
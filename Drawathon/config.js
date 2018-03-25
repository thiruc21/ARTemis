var config = {};
const env = require('get-env')();

//mongo database
config.mongo = {};
config.mongo.id = "mongodb://admin:hashedpass@art-shard-00-00-xs19d.mongodb.net:" +
"27017,art-shard-00-01-xs19d.mongodb.net:27017,art-shard-00-02-xs19d.mongodb.net" + 
":27017/test?ssl=true&replicaSet=Art-shard-0&authSource=admin";
config.mongo.dbname = 'test';

config.google = {};
config.google.clientid = '599342492421-8mhu8ms52vk6l4knoiveumt23uef9e7i.apps.googleusercontent.com';
config.google.cllientSecret = 'A-R_JDtyqlUg_kn-mbWxnXn-';

if (env === 'dev') {
    config.google.Callback = 'http://localhost:3000/users/oauth/google/callback'   
} else {
    config.google.Callback = 'http://art-emis.herokuapp.com/users/oauth/google/callback' //
}

module.exports = config;
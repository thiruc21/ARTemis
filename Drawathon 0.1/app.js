const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const http = require('http');
const PORT = 3000;

var index = 0;

var Datastore = require('nedb')
, strokes = new Datastore({ filename: 'strokes.db', autoload: true, timestampData: true})

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/api/draw/', function(req, res, next){
    console.log(req.body);
    index = index + 1;
    strokes.insert({_id: index, x:req.body.x, y:req.body.y, px:req.body.px, py: req.body.py, color: req.body.color}, function(err, item){
        if (err) return res.status(500).end(err);
        return res.json(item);
    });
});

app.get('/api/draw/', function(req, res, next){
    var limit = req.query.limit;
    if (limit == "all") {
        strokes.find({}).sort({createdAt: -1}).exec(function(err, strokes){
            if (err) return res.status(500).end(err);
		    var ret = [];
		    strokes.forEach(function(stroke){
			    ret.unshift(stroke);
            });
            return res.json(ret);
        });
    }
    else{
        strokes.find({}).sort({createdAt: -1}).limit(index - parseInt(limit)).exec(function(err, strokes){
            if (err) return res.status(500).end(err);
		    var ret = [];
		    strokes.forEach(function(stroke){
			    ret.unshift(stroke);
            });
            return res.json(ret);
        });
    }
});

app.get('/api/curr/', function(req, res, next){
    return res.json(index);
});

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
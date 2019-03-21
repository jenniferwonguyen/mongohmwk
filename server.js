// prevents undeclared variables
'use strict';

var express = require('express'),
var exphbs = require('express-handlebars'),
var bodyParser = require('body-parser'),
var mongoose = require('mongoose'),


//mongoose
var Note = require("./models/Note");
var Article = require("./models/Article");
var databaseUrl = 'mongodb://localhost/';

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(databaseUrl);
};

mongoose.Promise = Promise;
var db = mongoose.connection;

//show mongoose error
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

db.once("open", function() {
	console.log("Mongoose connected.");
});

// -------------------------------------------------------------------------------
var app = express();
var port = process.env.PORT || 8080;

//app set up
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended:true }))
    app.use(bodyParser.text())
    app.use(methodOverride('_method'))
    app.use(logger('dev'))
    app.use(express.static(__dirname + '/public'))
    app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
    app.set('view engine', 'handlebars')
    app.use(require('./controllers'));

    app.listen(port, function() {
        console.log("Listening on port " + port);
    })


module.exports = app;
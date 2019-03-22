//dependencies
var express = require('express');
var router = express.Router();
var path = require('path');

var axios = require("axios");

//require request and cheerio to scrape
var request = require('request');
var cheerio = require('cheerio');

//require models
var Comment = require('../models/Note.js');
var Article = require('../models/Article.js');

//index
router.get('/', function(req, res) {
    res.redirect('/articles');
});

//a GET request to scrape the website
router.get('/scrape', function(req, res) {
    console.log("inside scrape route");
    request("https://www.nytimes.com", function(error, response, html) {
        const $ = cheerio.load(html);
        let titlesArray = [];
        
        $("article h2").each(function(i, element) {
          let result = {};
          result.title = $(this).children('a').text();
          result.link = $(this).children('a').attr('href');
          let newArt = new Article(result);
          if (titlesArray.indexOf(result.title) === -1) {
            titlesArray.push(result.title); //save this title into titlesArray in case the article appears again in this scrape
            Article.count({ title: result.title}, function (err,dupeCheck){
              if (dupeCheck === 0) {
              
                let entry = new Article(result); //use Article model to create a new article document
                entry.save(function(err,doc){
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(doc);
                  }
                });
              } else {
                
              } 
            });//end of the database duplicate check logic
          } else {
           
          }
        }); 
      }, res.redirect("/")); // End of the request New York Times World News Page logic
});


//this will grab every article an populate the DOM
router.get('/articles', function(req, res) {
    
    Article.find().sort({_id: -1})
        //send to handlebars
        .exec(function(err, doc) {
            if(err){
                console.log(err);
            } else{
                var artcl = {article: doc};
                res.render('index', artcl);
            }
    });
});

//get the articles we scraped from the mongoDB in JSON
router.get('/articles-json', function(req, res) {
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

//clear all articles for testing purposes
router.get('/clearAll', function(req, res) {
    Article.remove({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('removed all articles');
        }

    });
    res.redirect('/articles-json');
});


module.exports = router;

//dependencies
var express = require('express');
var router = express.Router();
var path = require('path');

var axios = require("axios");

//require request and cheerio to scrape
var request = require('request');
var cheerio = require('cheerio');

//Require models
var Comment = require('../models/Note.js');
var Article = require('../models/Article.js');

//index
router.get('/', function(req, res) {
    res.redirect('/articles');
});

// A GET request to scrape the Verge website
router.get('/scrape', function(req, res) {
    console.log("inside scrape route");
    request("https://www.nytimes.com/section/world", function(error, response, html) {
        const $ = cheerio.load(html);
        let titlesArray = [];
        //  Process one story
        $("article h2").each(function(i, element) {
          let result = {};
          // Add the text and href of every link, and save them as properties of the result object
          result.title = $(this).children('a').text();
          result.link = $(this).children('a').attr('href');
          let newArt = new Article(result);
          if (titlesArray.indexOf(result.title) === -1) {
            //not a dupe of another article in the current scrape
            titlesArray.push(result.title); // so save this title into titlesArray in case the article appears again in this scrape
            // Now, make sure that this article hasn't previously been saved into the DB
            Article.count({ title: result.title}, function (err,dupeCheck){
              if (dupeCheck === 0) {
                // the article is not already in the DB because the dupeCheck in the callback had a value of 0 -- 
                // no articles matched.
                let entry = new Article(result); // so use Article model to create a new article document
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
        }); // End of "Process one story" logic
      }, res.redirect("/")); // End of the request New York Times World News Page logic
});


//this will grab every article an populate the DOM
router.get('/articles', function(req, res) {
    //allows newer articles to be on top
    //debugger
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

// This will get the articles we scraped from the mongoDB in JSON
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

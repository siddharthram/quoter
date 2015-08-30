var express = require('express');
var router = express.Router();
var PropertyReader  = require('properties-reader');
var properties      = PropertyReader("./properties");
var console = require('console');
var request = require('request');
var imgur_url = 'https://api.imgur.com/3/gallery/search/\?q\="earthporn"';
var reddit_url = 'http://api.reddit.com/r/quotes/hot.json?perPage=1'

/* GET home page. */
router.get('/', function(req, res, next) {
        getPic("landscape", function (ret) {
            res.render('index', {photo_url: ret.photo_url, quote: ret.quote});
        });
});



function getPic(theme, callback) {
    var imgur_key =  properties.get('imgur-client');
    var auth = 'Client-ID ' + imgur_key;
    //var agent =  "NodeJS:" + auth + ":<v.1>" + "\(by \/u\/\<srram\>\)";
    var agent =  "NodeJS:v.1 by /u/srram";
    console.log ("auth is....", auth);
    var imgur_options = {
        url: imgur_url,
        headers: {
            Authorization: auth
        }
    };
    var reddit_options = {
        url: reddit_url,
        headers: {
            'User-Agent': agent
        }
    };
    var quote;
    var photo;
    request(imgur_options, function(i_err, i_response, i_body) {
        if (!i_err && i_response.statusCode == 200) {
            var i_info = JSON.parse(i_body);
           // console.log('==info-==', i_info);
            var i_offset = random(0, i_info.data.length);
            console.log(i_info.data[i_offset].link);
            photo = i_info.data[i_offset].link;
            // get the reddit quote
            request(reddit_options, function (r_err, r_response, r_body) {

                var r_info = JSON.parse(r_body);
                //console.log ("body is ", JSON.stringify(r_info));

                if (!r_err && r_response.statusCode == 200) {
                    //console.log ("==reddit:====",r_info );
                    var r_offset = random (1, r_info.data.children.length);
                    console.log ("offset is" + r_offset);
                    quote = r_info.data.children[r_offset].data.title;
                    console.log ("qbote is..", quote);
                    var ret = {
                        photo_url: photo,
                        quote: quote
                    }
                callback(ret);
                } else {
                    console.log("reddit error", r_response.statusCode);
                }
            });
        } else {
            console.log("errored out",i_response, i_response.statusCode);
        }
    });
}

function random (low, high) {
    return Math.round(Math.random() * (high - low) + low);
}




module.exports = router;
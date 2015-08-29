var express = require('express');
var router = express.Router();
var PropertyReader  = require('properties-reader');
var properties      = PropertyReader("./properties");

var console = require('console');
var request = require('request');
console.log("key is", properties.get("flickr-key"));


var flickr = require('flickrapi');
var qod;
var auth;
var photo_url;

    flickrOptions = {
        api_key: properties.get("flickr-key"),
        secret: properties.get("flickr-secret")
    };


/* GET home page. */
router.get('/', function(req, res, next) {
    flickr.tokenOnly(flickrOptions, function (err, f) {
        getPic("landscape", f, function (res) {
            res.render('index', {photo_url: res.photo_url, quote: res.quote, author: res.auth});
        });
    });
});



function getPic(theme,flickr, callback) {
    // if (flickr == null) {
    // flickr = new flickrapi.Flickr(properties.get("flickr-key"));
    //}
    flickr.photos.search({
            text: "landscape",
            per_page: 1,
            extras: "url_l"
        },
        function (err, result) {
            if (err) {
                throw new Error(err);
            } else {
                console.log('photo json is', JSON.stringify(result));

                //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)
                /*
                 var url = "https://farm" +
                 result.photos.photo[0].farm   +
                 ".staticflickr.com"  + "/" +
                 result.photos.photo[0].server + "/" +
                 result.photos.photo[0].id +
                 "_" +
                 result.photos.photo[0].secret +
                 "_h" +
                 ".png";
                 */
                var qodoptions = {
                    host: 'api.theysaidso.com',
                    path: '/qod?category=inspire',
                };
                if (qod == null) {
                    request('http://api.theysaidso.com/qod.json?category=inspire', function (err, resp) {
                        if (err) {
                            console.log("theysaidsoerror:", err);
                        } else {
                            console.log("resp is", JSON.stringify(resp));
                            qod = resp.body.contents.quotes[0].quote;
                            auth = resp.contents.quotes[0].author;
                            var res = {
                                photo_url: result.photos.photo[0].url_l,
                                quote: qod,
                                author: auth
                            };
                            callback(res);
                        }
                    });
                } else {
                    var res = {
                        photo_url: result.photos.photo[0].url_l,
                        quote: qod,
                        author: auth

                    };
                    callback(res);
                }
            }
        })
}


module.exports = router;
var url = require('url');
var path = require('path');
var _ = require('lodash');
var PImage = require('pureimage');
var Promise = require('promise');

var fnt = PImage.registerFont(path.join(__dirname, 'fonts/OpenSans-Bold.ttf'), 'OpenSans-Bold');

function adjustFont (ctx, imgWidth, text) {
    var fontSize = 21;
    ctx.setFont('OpenSans-Bold', fontSize);
    while(ctx.measureText(text).width > imgWidth) {
        fontSize--;
        ctx.setFont('OpenSans-Bold', fontSize);
    }
}

function middlewareConstructor (options) {

    var pathRegExp,
        moduleOptions,
        loadPromise;


    loadPromise = new Promise(function (resolve, reject) {
        fnt.load(function (err/*, font*/) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    moduleOptions = _.defaults(options || {}, {
        imagePath: '/placeholder/'
    });

    pathRegExp = new RegExp('^' + (moduleOptions.imagePath || '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '([0-9]+)x?([0-9]+)?\/?([A-Fa-f0-9]{6})?\/?([A-Fa-f0-9]{6})?$', 'i');

    return function imageMiddleware (req, res, next) {
        var parsedUrl = url.parse(req.url, true),
            match,
            options,
            img;

        if (req.method !== 'GET' || _.isEmpty(parsedUrl.pathname)) {
            next();
            return;
        }

        match = parsedUrl.pathname.match(pathRegExp);

        if (!_.isArray(match) || _.compact(match).length < 2) {
            next();
            return;
        }

        options = _.defaults(_.extend(parsedUrl.query || {}, _.zipObject(['width', 'height', 'backgroundColor', 'color'], match.slice(1))), {
            text: null,
            backgroundColor: 'CCCCCC',
            color: '969696'
        });

        if (!_.isFinite(options.height)) {
            options.height = options.width;
        }
        if (typeof options.text !== 'string') {
            options.text = options.width + 'x' + options.height;
        }

        options.backgroundColor = '#' + options.backgroundColor;
        options.color = '#' + options.color;
        ['width', 'height'].forEach(function (key) { options[key] = _.parseInt(options[key]); });

        img = PImage.make(options.width, options.height);

        loadPromise.then(function () {
            var ctx = img.getContext('2d');
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, -1 , options.width, options.height + 1); //else we'll have a black line at top of IMG... :S
            ctx.fillStyle = options.color;
            ctx.USE_FONT_GLYPH_CACHING = true;
            adjustFont(ctx, img.width, options.text);
            ctx.fillText(options.text, (img.width - ctx.measureText(options.text).width) / 2, img.height / 2);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/png');
            PImage.encodePNG(img, res, next);
        }, function () {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/pain');
            res.end('404 Not Found');
        });


    };

}

// the middleware function
module.exports = middlewareConstructor;
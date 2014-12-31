#Connect Placeholder

> A connect middleware to generate placeholder images

Connect Placeholder generates PNG images on the flight. Could be use as a replacement for [Placehold.it](http://placehold.it/).

Image generation relies on [node-pureimage](https://github.com/joshmarinacci/node-pureimage/) by Josh Marinacci.

This middleware is primarily intended as a development middleware for [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect).

**Note: this is a work in progress. Expect performance issues and headaches.**
  
## Install

Install via npm:
 
```
npm install connect-placeholderimg  --save-dev
```

## Usage

In your Gruntfile.js `connect` task require the module inside a `middleware` option:

```js
connect: {
	options: {
		middleware: function(connect, options, middlewares) {
		  middlewares.unshift(require('connect-placeholderimg')({
		  	imagePath: '/placeholder/'
		  }));
		  return middlewares;
		}
	}
	...
}
```

Then, assuming the default connect task configuration is in place, point images `src` attribute to `http://localhost:8000/placeholder/WxH`.

For URL format please refer to [Placehold.it](http://placehold.it/)

## Options

### imagePath

Type: `String`
Default: `'/placeholder/'`

The base URI for placeholder images.  


## Release History

 * 2014-12-31   v0.0.1   WIP release

 
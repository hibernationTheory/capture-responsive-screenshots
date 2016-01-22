var casper = require('casper').create();
var main = require('./main.js');

main('./config.json', './data.json').then(function(x) {
	casper.exit();
});

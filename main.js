// import modules and install event listeners
var casper = require('casper').create({
    logLevel: 'info' //info, error, warning, debug
});
var fs = require('fs');
var utils = require('utils');


casper.on('error', function(msg) {
	console.log(msg)
});

casper.on('remote.message', function(message) {
    this.echo('remote message caught: ' + message);
});

function sanitizeStr(givenStr) {
	// a simple functions to sanitize a given string for filename usage
	var illegalChrs = ['/','<','>',':','"','\'','/','\\','|','?','*'];
	var newStrArray = [];
	givenStr.split('').forEach(function(chr) {
		var currChr;
		if (illegalChrs.indexOf(chr) > -1 ) {
			currChr = '_';
		} else {
			currChr = chr;
		}
		newStrArray.push(currChr);
	});
	var newStr = newStrArray.join('');
	return newStr;
}

// read in the data file, get links, 
// construct full urls if there is base url
var urls = [];
var dataFile = 'data.json';
var dataFileExists = fs.exists(dataFile);
if (!dataFileExists) {
	console.log('Can\'t locate data.json in the current directory');
	casper.exit();
}
var dataJson = fs.read(dataFile);
var data = JSON.parse(dataJson);
var baseUrl = data["baseUrl"] || '';
data["links"].forEach(function(item) {
	urls.push(baseUrl + item.url);
});

// read in the config file, get the target breakpoints
var breakpoints,
	imageSaveDir,
	pageHeight,
	waitDuration;
var configFile = 'config.json';
var configFileExists = fs.exists(configFile);
if (configFileExists) {
	var configJson = fs.read(dataFile);
	var config = JSON.parse(configJson);
	breakpoints = config.breakpoints;
	pageHeight = config.pageHeight || 2500;
	waitDuration = config.waitDuration || 1000;
	imageSaveDir = config.imageSaveDir || './images/';
}
if (!breakpoints) {
	breakpoints = [320, 768, 1200];
}

// start the event queue
casper.start();

casper.then(function() {
	var counter = 0;
	this.repeat(breakpoints.length, function() {
		var breakpoint = breakpoints[counter];
		this.viewport(breakpoint, pageHeight).each(urls, function(self, link) {
			self.thenOpen(link, function() {
				var pageTitle = this.getTitle();
				pageTitle = sanitizeStr(pageTitle);
				this.echo("Opening the url: " + link + "...");
				this.wait(waitDuration, function() {
					var filepath = imageSaveDir + 'pages_' + breakpoint + '_' + pageTitle +'.png'
					this.capture(filepath);
					this.echo('Saved the screenshot at: ' + filepath);
				});
			});

		});
		counter = counter + 1;
	});
});

casper.run();
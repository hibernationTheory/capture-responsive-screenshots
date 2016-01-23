var require = patchRequire(require);

var Q = require('q');

function main(configFileName, dataFileName, cb) {

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

	function createFolderNameFromCurrentDate() {
		// create a folder name derived from the date and time
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
			dd='0'+dd
		} 

		if(mm<10) {
			mm='0'+mm
		} 

		var todayStr = yyyy+'-'+mm+'-'+dd;
		var uniquePrefix = new Date().getTime().toString().substr(8);
		var folderName = todayStr + uniquePrefix;
		return folderName;
	}

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
	var dataFileExists = fs.exists(dataFileName);
	if (!dataFileExists) {
		console.log('Can\'t locate data.json in the current directory');
		casper.exit();
	}
	var dataJson = fs.read(dataFileName);
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
	var configFileExists = fs.exists(configFileName);
	if (configFileExists) {
		var configJson = fs.read(configFileName);
		var config = JSON.parse(configJson);
	}

	breakpoints = config && config.breakpoints || [320, 768, 1200];
	pageHeight = config && config.pageHeight || 2500;
	waitDuration = config && config.waitDuration || 1000;
	imageSaveDir = config && config.imageSaveDir || './images/';
	if (imageSaveDir.slice(-1) !== '/') {
		imageSaveDir += '/';
	}
	var subDirName = createFolderNameFromCurrentDate() + '/';

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
						var filepath = imageSaveDir + subDirName + 'pages_' + breakpoint + '_' + pageTitle +'.png'
						this.capture(filepath);
						this.echo('Saved the screenshot at: ' + filepath);
					});
				});

			});
			counter = counter + 1;
		});
	});

	casper.run(function() {
		cb();
	});
}

function promiseMain(configFileName, dataFileName) {
	var deferred = Q.defer();
	main(configFileName, dataFileName, function() {
		deferred.resolve();
	});
	return deferred.promise;
}

module.exports = promiseMain;

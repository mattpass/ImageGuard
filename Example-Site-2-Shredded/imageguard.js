// ImageGuard v1.0.0

;(function() {
	
	var imageGuard = {
		disableRightClick: true,		// true/false
		disablePrintingImage: true,		// true/false
		displayFakeImage: true,			// true/false
		displayFlashProtect: true,		// true/false
		displayFlashProtectMode: "shredded",	// original or shredded
		displayAltAttribute: true,		// true/false
		dataFileExtension: ".txt",		// the file extension of the _imageArray file, used for shredded images
		imagesFolder: "images/",		// the initial images folder, including trailing slash

		init: function() {
			var spans = document.getElementsByTagName("span");
			for (var ind in spans) {
				// for each one of those spans, if the class name attribute on it is imageGuard, run the next bit of our script
				if(spans[ind].className && spans[ind].className.toLowerCase() == "imageguard") {
					this.guard(spans[ind]);
				}
			}
			
			// set a CSS rule to stop protected images from being printed
			if (this.disablePrintingImage) {
				var headTag = document.getElementsByTagName("head")[0];
				var stylesheet = document.createElement('style');
				stylesheet.type = 'text/css';
				stylesheet.rel = 'stylesheet';
				stylesheet.media = 'print';
				headTag.appendChild(stylesheet);
				stylesheet.innerHTML = '.imageGuard {display: none;}';
			}

			// disable right-clicking by returning false on triggering the context menu
			if (this.disableRightClick) {
				document.oncontextmenu = function(){return false};
			}
		},
		guard: function(el) {
			// we can turn this into a loop if we want to go over multiple images
			var image = el.getElementsByTagName('img')[0];
			
			var imgAtt = ["src","width","height","alt"];
			var atts = {};
			// preparing image attributes for easy access
			for(var att in imgAtt) {
				atts[imgAtt[att]] = image.getAttribute(imgAtt[att]).split(":")[0];
				if (att == 0) {var imageType = image.getAttribute(imgAtt[att]).split(":")[1]};
			}
			// define an alt attribute, if the option is enabled, otherwise set to blank
			var altText = this.displayAltAttribute ? ('alt="' + atts['alt'] + '"') : '';

			// if we're due to display a fake image, build up the HTML in a new variable
			if (this.displayFakeImage) {
				// firstly, using the alt attribute, create the fake image filename, then produce our HTML in a variable
				var imageDisplay  = '<div style="position:absolute;width:100%;left:0px">';
				imageDisplay += '<img src="' + this.imagesFolder + atts['alt'].replace(/ /g,"-").toLowerCase() + '.png'
						+ '" ' + altText + ' width="' + atts['width'] + '" height="' + atts['height'] + '">';
				imageDisplay += '</div>';
			// otherwise, set it to be blank
			} else {
				var imageDisplay='';
			};

			// now, if we have the Flash protection option enabled, create the HTML needed in a new variable
			// firstly, set a variable to be the alt attribute, turned into the filename (minus the file extension)
			var altAttFile = atts['alt'].replace(/ /g,"-").toLowerCase();
			if (this.displayFlashProtect) {
				// next, set a variable to be the Flash SWF file reference with all the querystring variables it needs
				var flashSrc = 'imageguard.swf?imageSrc='+ atts['src'] + '&imageWidth=' + atts['width']
					+ '&imageHeight=' + atts['height'] + '&alt=' + altAttFile + '&displayFlashProtectMode=' + this.displayFlashProtectMode
					+ '&dataFileExtension=' + this.dataFileExtension + '&imageType=' + imageType;
				// now we can setup our variable containing all the HTML needed to show the Flash file
				var flashDisplay  = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
					+ 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"'
					+ ' width="' + atts['width'] + '" height="' + atts['height'] + '">'
					+ '<param name="allowScriptAccess" value="sameDomain" />'
					+ '<param name="movie" value="' + flashSrc + '" />'
					+ '<param name="quality" value="high" />'
					+ '<param name="wmode" value="transparent" />'
					+ '<embed src="' + flashSrc + '" quality="high" wmode="transparent" width="' + atts['width']
					+ '" height="' + atts['height'] + '" allowScriptAccess="sameDomain" type="application/x-shockwave-flash"'
					+ ' pluginspage="http://www.macromedia.com/go/getflashplayer" />'
					+ '</embed>'
					+ '</object>';
			// otherwise, show the original file
			} else {
				var flashDisplay = '<img src="originals/' + altAttFile + '.' + imageType +'" ' + altText + ' width="' + atts['width']
					+ '" height="' + atts['height'] + '">';
			};

			// last of all, set the inner HTML of the span conatiner to our 2 defined varibles
			el.innerHTML = imageDisplay + flashDisplay;
		}
	};

	// add onload event without overriding existing one
	var load = function() {
		// quit if this function has already been called
		if (arguments.callee.done) return;
		imageGuard.init();
		// flag this function so we don't do the same thing twice
		arguments.callee.done = true;
	};
	if (window.addEventListener){
		window.addEventListener('load', load, false);
	} else if (window.attachEvent){
		window.attachEvent('onload', load);
	}
})();
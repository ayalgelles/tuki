TukiUtils = function() {
	var self = this;
	self.getTime = function() {
		var d = new Date();
		var curr_hour = d.getHours();
		var curr_min = d.getMinutes();
		var res = {
			h: curr_hour,
			m: curr_min
		};
		return res;
	};
	String.prototype.toCapitalize = function() {
		return this.toLowerCase().replace(/^.|\s\S/g, function(a) {
			return a.toUpperCase();
		});
	};
	Array.prototype.remove = function() {
		var what, a = arguments,
			L = a.length,
			ax;
		while(L && this.length) {
			what = a[--L];
			while((ax = this.indexOf(what)) != -1) {
				this.splice(ax, 1);
			}
		}
		return this;
	};

	Array.prototype.unique = function() {
		var a = this.concat();
		for(var i = 0; i < a.length; ++i) {
			for(var j = i + 1; j < a.length; ++j) {
				if(a[i] === a[j]) a.splice(j, 1);
			}
		}

		return a;
	};
	window.regit = function(re, str) {
		var arr = [];
		var match = null;
		while(match = re.exec(str)) {
			var obj = {};
			for(var grp = 1; grp < match.length; grp++) {
				obj[grp] = match[grp];
			}

			arr.push(obj);
		}
		return arr;
	};


	window.imgCache = {
		get: function(x, keepHidden) {
			if(!keepHidden) {
				this[x].css('left', '');
				this[x].css('position', '');
			}
			try {

				return this[x][0];
			} catch(x) {
				return null;
			}

		},
		wait: function(path, cb, nobust) {

			var after = function(img) {
					$(img).css('left', '').css('position', '');
					cb(img);
				};

			if(this[path]) {
				after(this[path][0]);
			} else {
				$.when.apply($, imgPromises([path], nobust)).done(after);
			}
		},

		waitAll: function(arr, cb, nobust, rightaway) {
			var incache = [];
			var notincache = [];

			$.each(arr, function(i, path) {
				if(imgCache[path] && imgCache[path][0]) {
					incache.push(imgCache[path][0]);
				} else {
					notincache.push(path);
				}
			});

			if(rightaway) {
				cb(imgCache[arr[0]]);
				return;
			}

			$.when.apply($, imgPromises(notincache, nobust)).done(function() {
				imgCache.waitAll(notincache, function(x) {
					cb(imgCache[arr[0]]);
				}, nobust, true);
			});
		}

	};

	window.imgPromises = function(preload, nobust) {
		var promises = [];
		for(var i = 0; i < preload.length; i++) {
			promises.push($.Deferred());
			(function(url, promise) {
				var img = new Image();
				$('body').append(img);
				imgCache[url] = $(img);
				var leClass = regit(/([^\/]*?)\./g, url)[0]['1'];
				var bust = nobust ? '' : '?v=16';
				$(img).addClass(leClass).attr('src', url + bust).css('position', 'absolute').css('left', '-10000px').load(function() {
					promise.resolve(this);
				});
				if($.browser.msie && ($.browser.version === '7.0' || $.browser.version === '8.0')) {
					promise.resolve(img);
				}

			})(preload[i], promises[i]);
		}

		return promises;
	};
	self.htmlescape = function(str){
            return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        };
	self.ddmmyyyy = function(today, delimit, dateobj) {
		delimit = delimit || '-';

		if(today && typeof today === 'object') {
			d = today;
		} else if(today) {
			d = new Date(today);
		} else {
			d = new Date();
		}
		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1;
		var curr_year = d.getFullYear();
		if(dateobj) {
			resdate = {
				str: curr_date + delimit + curr_month + delimit + curr_year,
				obj: d
			};
		} else {
			resdate = curr_date + delimit + curr_month + delimit + curr_year;
		}
		return resdate;
	};
	self.sendAnalytics = function(msg_method, event_category, event_action, event_label, event_value, optionalparam) {
		optionalparam = optionalparam || '';
		var plength = 0;
		if(BBEXT.globalObj.bbscrapemedia && BBEXT.globalObj.bbscrapemedia.playlist) {
			plength = BBEXT.globalObj.bbscrapemedia.playlist.length;
		}
		chrome.extension.sendRequest({
			'msg_type': 'method',
			'method': msg_method,
			'url': location.href,
			'hostname': location.hostname,
			'playlistlength': plength,
			'event_category': 'Web_user_engagment',
			'event_action': event_action,
			'event_label': event_label,
			'event_value': event_value,
			'optionalparam': optionalparam
		}, function(response) {});
	};
	self.log = function() {
		self.log.history = self.log.history || [];
		self.log.history.push(arguments);
		if(console) {
			console.log(Array.prototype.slice.call(arguments));
		}
	};
	self.getParameterByName = function(url, name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		if(results === null) {
			return "";
		} else {
			return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	};
	self.isNumber = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	self.S4 = function() {
		return(((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
};
tukiUtils = new TukiUtils();
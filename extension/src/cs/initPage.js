var newdiv = document.createElement('div');
newdiv.setAttribute('id', 'extensionInstalled');
document.body.appendChild(newdiv);
YTCEXT = {};
YTCEXT.objmanifest = {};
YTCEXT.deffParam = $.Deferred();
chrome.extension.sendRequest({
	'msg_type': 'method',
	'method': 'getparams'
}, function(response) {
	console.log(response);
	YTCEXT.objmanifest = response;
	YTCEXT.deffParam.resolve();
});
YTCEXT.injectbtn = function() {
	var btnhtml = '<span><button title="Chat with friends" onclick=";return false;" id="ytchat" class=" yt-uix-button yt-uix-button-hh-text yt-uix-tooltip" type="button" data-position="bottomright" data-like-tooltip="Chat with friends" data-orientation="vertical" role="button"><span class="yt-uix-button-icon-wrapper"><span class="yt-uix-button-valign"></span></span><span class="yt-uix-button-content">Chat Now</span></button></span>';
	$('#watch-like-dislike-buttons').append(btnhtml);
	$('#ytchat').click(function() {
		var vidarr = location.href.match(/[\d|\w|-]{11}/);
		if(vidarr !== null) {
			if(vidarr[0].length === 11) {
				chrome.extension.sendRequest({
					'msg_type': 'method',
					'method': 'openchatab',
					'vid': vidarr[0]
				}, function(response) {
					console.log(response);
				});
			}
		}
	});
};
InitPage = function() {
	var self = this;
	$(document).ready(function() {
		$.when(YTCEXT.deffParam).done(function() {
			if(location.href.match('.youtube.com/watch')) {
				YTCEXT.injectbtn();
			}
		});

	});
};
YTCEXT.initPage = new InitPage();
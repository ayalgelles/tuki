RoomReady = $.Deferred();

window.room = param('rid');
window.vid = param('vid');

if (window.room) {
    RoomReady.resolve();
}

FBStatus.done(function(stat) {
		  if (stat !== 'connected') {
		      $('.fbmodal').modal({backdrop: true}).show();
		      $('.fbcnt').click(function(){
					    fblogin();
					});
		  }
		  FBLoggedIn.done(function(resp){
				      FB.ui({method: 'apprequests',
					     message: 'wants to watch a video with you on Tuki'
					    }, function(res){
						window.room = $.merge([FB.getUserID()], [res.to])
						    .sort(function(a,b){
							      return parseInt(a) - parseInt(b);
							  }).join('-');
						console.log('room is', window.room);
						RoomReady.resolve();
						$('.fbmodal').modal('hide');								  
					    });
				      
				  });

	      });

function chatController($scope, $defer) {
    $.when(FBLoggedIn, RoomReady).done(function(){
	var x = new Firebase('http://ayal.firebaseio.com/' + FB.getUserID());
	roomref = x.child(window.room);
	roomref.set({date: (new Date()).getTime()});

	$scope.firebaseRef = new Firebase('http://ayal.firebaseio.com/' + window.room);
	$scope.name = '';
	$scope.text = '';
	$scope.messages = [];

	$scope.addMessage = function() {
	    $scope.firebaseRef.push({fbid: FB.getUserID(), name:window.name, text:$scope.text});
	    $scope.text = '';
	};

	if (window.vid) {
	    $scope.firebaseRef.push({fbid: FB.getUserID(), name: window.name, vid:window.vid, text: '[[' + window.vid + ']]', date: (new Date()).getTime()});
	}

	$scope.firebaseRef.on('child_added', function(snapshot){
	    var message = snapshot.val();
	    if (message.vid) {
		clearTimeout(window.debounce);
		window.debounce = setTimeout(function(){
		    putvideo(message.vid);
		},1000);
	    }
	    $defer(function(){
		$scope.messages.push({fbid: message.fbid, name:message.name, text:message.text});
	    }, 0);
	});

    });
}
chatController.$inject = ['$scope','$defer'];

var putvideo = function(id){
    $('<iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>').appendTo('#video');
};

$(document).ready(function() {  
    if (window.vid) {
	putvideo(window.vid);
	putvideo = $.noop;
    }
});
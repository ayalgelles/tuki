function param(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results === null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function chatController($scope, $defer) {
   
  $scope.firebaseRef = new Firebase('http://ayal.firebaseio.com/' + param('rid'));
  $scope.name = '';
  $scope.text = '';
  $scope.messages = [];
  $scope.addMessage = function() {
    $scope.firebaseRef.push({name:$scope.name, text:$scope.text});
    $scope.text = '';
  };
  $scope.firebaseRef.on('child_added', function(snapshot){
    var message = snapshot.val();
    $defer(function(){$scope.messages.push({name:message.name, text:message.text});},0);
  });
}
chatController.$inject = ['$scope','$defer'];

var param = function(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

var putvideo = function(id){
    $('<iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>').appendTo('#embedvideo');
}

var fetchVidInfo = function(vidid) {
    var api_url = '//gdata.youtube.com/feeds/api/videos/' + vidid + '?v=2&alt=json&callback=?';
                $.ajax({
                        url: api_url,
                        cache: false,
                        dataType: 'json',
                        success: function(data) {
                                //vidbox.picurl = data.entry.media$group.media$thumbnail[1].url || '';
                                $('#title').text(data.entry.title.$t || '');
								$('#authorname').text(data.entry.author[0].name.$t);
								$('#views').text(numberWithCommas(data.entry.yt$statistics.viewCount));
								var api_url = '//gdata.youtube.com/feeds/api/users/' + data.entry.author[0].name.$t + '?v=2&alt=json&muu=' + (new Date()).getTime() + '&callback=?';
								$.ajax({
				                        url: api_url,
				                        cache: false,
				                        dataType: 'json',
				                        success: function(data) {
				                               $('#authorthumbnail').attr('src', data.entry.media$thumbnail.url);
				                        }
								});
                                //vidbox.desc = data.entry.media$group.media$description.$t || '';
                        }
				});
};

var numberWithCommas = function(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

$(document).ready(function() {  
    var rid = param("rid");
    putvideo(rid);
	fetchVidInfo(rid);
});
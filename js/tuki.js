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
    $('<iframe width="560" height="315" src="http://www.youtube.com/embed/"' + id + '" frameborder="0" allowfullscreen></iframe>').appendTo('#video');
}


chatController.$inject = ['$scope','$defer'];

$(document).ready(function() {  
    var rid = param("rid");
    putvideo(rid);
});

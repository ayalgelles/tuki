RoomReady = $.Deferred();

window.room = param('rid');
window.vid = param('vid');
window.requestIds = param('request_ids');

if(window.requestIds && !window.vid) {
       var ref = new Firebase('http://ayal.firebaseio.com/' + requestIds);
       ref.on('child_added', function(snapshot) {
              var dbroom = snapshot.val();
              location.href = '/?rid=' + dbroom;
       });
} else {
       $(function() {
              $('body').show();
       });
}

if(window.room) {
       RoomReady.resolve();
}

FBStatus.done(function(stat) {
       if(stat !== 'connected') {
              $('.fbmodal').modal({
                     backdrop: true
              }).show();
              $('.fbcnt').click(function() {
                     fblogin();
              });
       }

       FBLoggedIn.done(function(resp) {
              if(window.room) {
                     return;
              }
              $('.modal').modal('hide');
              $('.roomodal').modal({
                     backdrop: true
              }).show();

              $('.newbtn').click(function() {
                     FB.ui({
                            method: 'apprequests',
                            message: 'wants to watch a video with you on Tuki'
                     }, function(res) {
                            console.log('res', res);
                            window.roomData = {
                                   users: $.merge([FB.getUserID()], res.to),
                                   id: GUID()
                            };
                            window.room = roomData.id;

                            window.reqid = res.request;
                            console.log('room is', window.room);
                            RoomReady.resolve();
                            $('.modal').modal('hide');
                     });
              });
       });

});

function chatController($scope, $defer) {
       $.when(FBLoggedIn, RoomReady).done(function() {
              uref = new Firebase('http://ayal.firebaseio.com/' + window.room + '/data/users/' + FB.getUserID());
              uref.setOnDisconnect(false);
              uref.set(true);

              $scope.whoz = [];
              var users = new Firebase('http://ayal.firebaseio.com/' + window.room + '/data/users');
              users.on('value', function(snap) {
                     $defer(function() {
                            var newwhoz = [];
                            $.each(snap.val(), function(k, v) {
                                   v && newwhoz.push({
                                          fbid: k
                                   });
                            });
                            $scope.whoz = newwhoz;
                     }, 0);
              });

              var x = new Firebase('http://ayal.firebaseio.com/' + FB.getUserID());
              window.roomref = x.child(window.room);
              $scope.firebaseRef = new Firebase('http://ayal.firebaseio.com/' + window.room + '/messages');

              if(window.reqid) {
                     var req = new Firebase('http://ayal.firebaseio.com/' + window.reqid);
                     req.set({
                            room: window.room
                     });
              }

              $scope.name = '';
              $scope.text = '';
              $scope.messages = [];


              $scope.addMessage = function() {
                     $scope.firebaseRef.push({
                            fbid: FB.getUserID(),
                            name: window.name,
                            text: $scope.text,
                            date: (new Date()).getTime()
                     });
                     $scope.text = '';
              };

              if(window.vid) {
                     $scope.firebaseRef.push({
                            fbid: FB.getUserID(),
                            name: window.name,
                            vid: window.vid,
                            text: '[[' + window.vid + ']]',
                            date: (new Date()).getTime()
                     });
              }

              $scope.firebaseRef.on('child_added', function(snapshot) {
                     var message = snapshot.val();
                     if(message.vid) {
                            clearTimeout(window.debounce);
                            window.debounce = setTimeout(function() {
                                   putvideo(message.vid);
                            }, 1000);
                            setTimeout(function() {
                                   var elem = document.getElementById('messagesDiv');
                                   elem.scrollTop = elem.scrollHeight;
                            }, 0);
                     }
                     $defer(function() {
                            $scope.messages.push({
                                   fbid: message.fbid,
                                   name: message.name,
                                   text: message.text
                            });
                     }, 0);
              });

       });
}
chatController.$inject = ['$scope', '$defer'];

var putvideo = function(id) {
              $('<iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>').appendTo('#embedvideo');
       };

var fetchVidInfo = function(vidid) {
              var api_url = '//gdata.youtube.com/feeds/api/videos/' + vidid + '?v=2&alt=json&callback=?';
              $.ajax({
                     url: api_url,
                     cache: false,
                     dataType: 'json',
                     success: function(data) {
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
                     }
              });
       };

var numberWithCommas = function(x) {
              x = x.toString();
              var pattern = /(-?\d+)(\d{3})/;
              while(pattern.test(x))
              x = x.replace(pattern, "$1,$2");
              return x;
       };
$(document).ready(function() {
       if(window.vid) {
              putvideo(window.vid);
              putvideo = $.noop;
       }
});
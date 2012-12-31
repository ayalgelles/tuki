RoomReady = $.Deferred();

window.room = param('rid');
window.vid = param('vid');
window.requestIds = param('request_ids').split(',').splice(-1)[0];

if(window.requestIds && !window.vid) {
       var ref = new Firebase('http://ayal.firebaseio.com/requests/' + requestIds);
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

              $('.roomsbtn').click(function() {
                     $('.roomodal modal-body').html();
                     $('.roomodal modal-body');
              });

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
                            $.each(roomData.users, function(i, fbid) {
                                   uref = new Firebase('http://ayal.firebaseio.com/rooms/' + roomData.id + '/data/users/' + fbid + '/invited');
                                   uref.set(FB.getUserID());
                            });
                            window.room = roomData.id;

                            window.reqid = res.request;
                            console.log('room is', window.room);
                            RoomReady.resolve();
                            $('.modal').modal('hide');
                     });
              });
       });

});

function roomsControl($scope, $defer) {
       FBLoggedIn.done(function() {
              window.myref = new Firebase('http://ayal.firebaseio.com/users/' + FB.getUserID());
              $scope.roomz = [{
                     users: [{
                            fbid: 1
                     }],
                     id: 2
              }];

              window.myref.on('value', function(snap) {

                     var newroomz = [];
                     var defz = [];
                     if(!snap.val()) {
                            return;
                     }
                     $.each(snap.val(), function(k, v) {
                            var roomdef = $.Deferred();
                            defz.push(roomdef);
                            var roomusers = new Firebase('http://ayal.firebaseio.com/rooms/' + k + '/data/users');
                            roomusers.on('value', function(snap) {

                                   var theusers = [];
                                   $.each(snap.val(), function(k, v) {
                                          theusers.push({
                                                 fbid: k
                                          });
                                   });
                                   newroomz.push({
                                          users: theusers,
                                          id: k
                                   });
                                   roomdef.resolve();
                            });
                     });

                     $.when.apply($, defz).done(function() {

                            $defer(function() {
                                   $scope.roomz = newroomz;
                            }, 0);

                     });
              });
       });
}

roomsControl.$inject = ['$scope', '$defer'];

function chatController($scope, $defer) {
       $.when(FBLoggedIn, RoomReady).done(function() {
              uref = new Firebase('http://ayal.firebaseio.com/rooms/' + window.room + '/data/users/' + FB.getUserID() + '/online');
              uref.setOnDisconnect(false);
              uref.set(true);

              $scope.whoz = [];
              var users = new Firebase('http://ayal.firebaseio.com/rooms/' + window.room + '/data/users');
              users.on('value', function(snap) {
                     $defer(function() {
                            var newwhoz = [];
                            $.each(snap.val(), function(k, v) {
                                   v.online && newwhoz.push({
                                          fbid: k
                                   });
                            });
                            $scope.whoz = newwhoz;
                     }, 0);
              });
              window.myref = new Firebase('http://ayal.firebaseio.com/users/' + FB.getUserID());
              window.roomref = window.myref.child(window.room);
              roomref.set({
                     date: (new Date()).getTime()
              });
              $scope.firebaseRef = new Firebase('http://ayal.firebaseio.com/rooms/' + window.room + '/messages');

              if(window.reqid) {
                     var req = new Firebase('http://ayal.firebaseio.com/requests/' + window.reqid);
                     req.set({
                            room: window.room
                     });
              }
              $scope.name = '';
              $scope.text = '';
              $scope.messages = [];
              $scope.addMessage = function() {
                     if($scope.text === '') return false;
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
                            isvid: 'true',
                            date: (new Date()).getTime()
                     });
              }

              $scope.firebaseRef.on('child_added', function(snapshot) {
                     var message = snapshot.val();
                     if(message.vid) {
                            clearTimeout(window.debounce);
                            window.debounce = setTimeout(function() {
                                   putvideo(message.vid);
                                   fetchVidInfo(message.vid);
                            }, 1000);
                     }
                     $defer(function() {
                            $scope.messages.push({
                                   fbid: message.fbid,
                                   name: message.name,
                                   text: message.text,
                                   isvid: message.isvid,
                                   vid: message.vid,
                                   date: ddmmyyyy('-', new Date(message.date))
                            });
                            setTimeout(function() {
                                   var elem = document.getElementById('messagesDiv');
                                   if(elem.scrollHeight) {
                                          elem.scrollTop = elem.scrollHeight;
                                   }

                            }, 0);
                     }, 0);
              });

       });
}
chatController.$inject = ['$scope', '$defer'];

var putvideo = function(id) {
              $('<iframe width="100%" height="100%" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>').appendTo('#embedvideo');
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
              fetchVidInfo(window.vid);
       }
       $('#messagesDiv,#embedvideo').height($(window).height() - 300);
       $("#messageInput").keypress(function(e) {
              if(e.which == 13) {
                     //submit form via ajax, this is not JS but server side scripting so not showing here
                     // $("#chatbox").append($(this).val() + "<br/>");
                     // $(this).val("");
                     // e.preventDefault();
                     $('form').submit();
              }
       });

});
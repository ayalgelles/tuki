BBEXT = {};
BBEXT.objmanifest = {};
BBEXT.defManifest = $.Deferred();
BBEXT.objmanifest = (function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            manifestObject = JSON.parse(xhr.responseText);
            manifestObject.destserver = localStorage.destserver = "http://5.wemoovu.appspot.com";
            manifestObject.chatserver = localStorage.chatserver = "http://hackathonmoovu.appspot.com";
            manifestObject.fbappid = localStorage.fbappid = "468546183182071";
            manifestObject.gaccount = localStorage.gaccount = "UA-26568718-1";
            manifestObject.fbprem = localStorage.fbprem = "email,publish_actions,read_stream";
            BBEXT.defManifest.resolve();
        }
    };
    xhr.open("GET", chrome.extension.getURL('/manifest.json'), false);
    try {
        xhr.send();
    } catch(e) {
        console.log('Couldn\'t load json');
    }
    return manifestObject;
})();
if(!localStorage.pushMsgStat) {
    pushstat = {
        playlist: {
            flag: false,
            stamp: (new Date().getTime())
        },
        playlistnight: {
            flag: false,
            stamp: (new Date().getTime())
        }
    };
    localStorage.pushMsgStat = JSON.stringify(pushstat);
}
var _gaq = _gaq || [];
_gaq.push(['_setAccount', localStorage.gaccount]);
BBEXT.context = false;
BBEXT.defcontext = $.Deferred();
GlobalObj = function() {
    var selfthis = this;
    selfthis.userIsConnected = $.Deferred();
    selfthis.userStatusConnected = $.Deferred();
    selfthis.internetConnection = $.Deferred();
    selfthis.msgDeff = $.Deferred();
    selfthis.kpalivto = 0;
    selfthis.req = 0;
    selfthis.proxytimer = 0;
    selfthis.liveproxy = false;
    selfthis.bbactionbtn = false;
    selfthis.bbscraped_list = {};
    selfthis.fbloginwindowid = '';
    selfthis.globalactionname = 'NOACTION';
    selfthis.firstRun = (localStorage.firstRun == 'true');
    selfthis.sdkblocker = 0;
    selfthis.lastWatchedVids = [];
    selfthis.pushlastWatchedVids = localStorage.pushlastwatch || [];

};
BBEXT.globalObj = new GlobalObj();
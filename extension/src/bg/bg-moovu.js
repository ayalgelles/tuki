BBoneGAnalytics = function() {
        var selfthis = this;
        selfthis.setConnectedCustomVar = function(ctx) {
                ctx = ctx || BBEXT.context;
                _gaq.push(['_setCustomVar', 1, 'user', ctx.bb_users.current, 2]);
                _gaq.push(['_setCustomVar', 5, 'user-status', ctx.status, 2]);
                _gaq.push(['_trackEvent', 'Funnel', 'Ext_setConnectedCustomVar', '-' + ctx.bb_users.current + ', Status: ' + ctx.status, 1]);
        };

        selfthis.keepitalive = function() {
                var today = BBEXT.extUtils.ddmmyyyy();
                var oneDay = 1000 * 60 * 60 * 24;
                var days = -1;
                var weeks = -1;
                var months = -1;
                var d = new Date();
                var now = d.getTime();
                var dm = d.getMonth() + 1;
                dm = '-' + dm + '-';
                if(localStorage.installedate) {
                        var start = localStorage.installedate;
                        var diff = now - start;
                        days = Math.floor(diff / oneDay);
                        weeks = Math.floor(diff / (oneDay * 7));
                        months = Math.floor(diff / (oneDay * 30));
                        localStorage.seniordays = days;
                } else {
                        localStorage.installedate = now - (oneDay * 10000);
                        localStorage.seniordays = 10000;
                }
                BBEXT.proxy.setSeniorCookie({
                        name: 'bbextdata',
                        data: {
                                days: parseInt(days, 10),
                                ver: BBEXT.objmanifest.version
                        }
                });
                if(!localStorage.keepaliveweek || (now > parseInt(localStorage.keepaliveweek, 10) + 604800000)) {
                        localStorage.keepaliveweek = now;
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_weekly_keep_alive', 'User: ' + BBEXT.context.bb_users.current + ', Status: ' + BBEXT.context.status + ', Ver: ' + BBEXT.objmanifest.version + ', today:' + today, weeks]);
                        _gaq.push(['_trackPageview', '/extension/weeklykeepalive/' + weeks + '/' + today + '/' + BBEXT.objmanifest.version]);
                        console.log('/extension/weeklykeepalive/', '/extension/weeklykeepalive/' + weeks + '/' + today + '/' + BBEXT.objmanifest.version, weeks);
                }
                if(!localStorage.keepalivetoday || (today !== localStorage.keepalivetoday)) {
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_keep_alive', 'Ver: ' + BBEXT.objmanifest.version + ', today:' + today + ',s=' + days, days]);
                        _gaq.push(['_trackPageview', '/extension/keepalive/' + today + '/' + BBEXT.objmanifest.version]);
                        if(localStorage.keepalivetoday && localStorage.keepalivetoday.indexOf(dm) === -1) {
                                _gaq.push(['_trackEvent', 'Funnel', 'Ext_monthly_keep_alive', 'User: ' + BBEXT.context.bb_users.current + ', Status: ' + BBEXT.context.status + ', Ver: ' + BBEXT.objmanifest.version + ', today:' + today, months]);
                                _gaq.push(['_trackPageview', '/extension/monthlykeepalive/' + today + '/' + BBEXT.objmanifest.version]);
                        }
                        localStorage.keepalivetoday = today;
                }
                selfthis.setCustomVarSession(BBEXT.context);
        };
        selfthis.keepalivetimeout = function() {
                selfthis.keepitalive();
                selfthis.i += 1;
                clearTimeout(BBEXT.globalObj.kpalivto);
                BBEXT.globalObj.kpalivto = setTimeout(function() {
                        selfthis.keepalivetimeout();
                }, 5400000);
        };
        selfthis.setCustomVarSession = function(ctx) {
                ctx.n = ctx.n || 'x';
                localStorage.seniordays = localStorage.seniordays || 'x';
                var orgref = localStorage.bbreforigin || '';
                orgref = 'org=' + orgref + '-';
                var sess = 'ext-d=' + BBEXT.extUtils.ddmmyyyy(undefined, ',', undefined) + '-s=' + localStorage.seniordays + '-v=' + BBEXT.objmanifest.version + '-n=' + ctx.n + '-' + orgref;
                BBEXT.context.sess = sess;
                // console.log('sess' + sess);
                _gaq.push(['_setCustomVar', 2, 'sessionid', sess, 2]);
                _gaq.push(['_trackEvent', 'Funnel', 'session-ext', sess, 1, true]);
        };
        selfthis.setCustomVarHostname = function(hstnm) {
                _gaq.push(['_setCustomVar', 4, 'ref', hstnm, 3]);
                // _gaq.push(['_trackEvent', 'Funnel', 'hostname-ext', hstnm, 1, true]);
        };
        selfthis.setSession = function(ctx) {
                _gaq.push(['_setCustomVar', 1, 'user', ctx.bb_users.current, 2]);
                _gaq.push(['_setCustomVar', 3, 'paircode', ctx.paircode, 3]);
                _gaq.push(['_setCustomVar', 4, 'ref', 'background', 3]);
                _gaq.push(['_setCustomVar', 5, 'user-status', 'ext-pre-auth', 2]);
                selfthis.setCustomVarSession(ctx);
                // _gaq.push(['_trackPageview', '/extension/setSession/' + ctx.paircode]);
                if(!BBEXT.globalObj.firstRun) {
                        BBEXT.install.openplaylistfirstime(ctx);
                } else {
                        BBEXT.core.setversion(ctx);
                }
                BBEXT.proxy.setiframesrc('THE FIRST TRY');
        };
        //recommit
        selfthis.sendGAnalytics = function(request) {
                console.log(request.event_action, request);
                if(request.optionalparam && request.optionalparam.setpagehost) {
                        selfthis.setCustomVarHostname(request.hostname);
                }
                if(request.event_action.match(/Ext_Close_|Ext_hover_/)) {
                        _gaq.push(['_trackPageview', '/extension/' + request.event_action]);
                } else {
                        _gaq.push(['_trackPageview', '/extension/' + request.event_action]);
                        _gaq.push(['_trackEvent', request.event_category, request.event_action, request.event_label + ' page:' + request.hostname, request.event_value]);
                }

                if(!BBEXT.globalObj.internetConnection.isResolved()) {
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_offline', 'check if online again by user action -' + request.event_action, 1]);
                        BBEXT.core.callwhoami(0);
                }
        };
        selfthis.loadAnalytics = function() {
                (function() {
                        var ga = document.createElement('script');
                        ga.type = 'text/javascript';
                        ga.async = true;
                        ga.src = 'https://ssl.google-analytics.com/ga.js';
                        var s = document.getElementsByTagName('script')[0];
                        s.parentNode.insertBefore(ga, s);
                })();
        };

        selfthis.track = function(arr) {
                console.log(arr[2], arr[3]);
                _gaq.push(arr);
        };
};
BBEXT.bbga = new BBoneGAnalytics();
BBoneCore = function() {
        var selfcore = this;
        selfcore.callwhoami = function(count) {
                if(count === 3) {
                        BBEXT.globalObj.sdkblocker = 0;
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_offline', 'USER IS OFFLINE!', 1]);
                        return false;
                }
                BBEXT.globalObj.internetConnection = $.Deferred();
                $.when(BBEXT.globalObj.internetConnection).done(function(ctx) {
                        BBEXT.bbga.setSession(ctx);
                        BBEXT.bbga.loadAnalytics();
                });
                BBEXT.globalObj.req = $.get(localStorage['destserver'] + '/whoami', function(ctxt) {
                        BBEXT.context = JSON.parse(ctxt);
                        BBEXT.globalObj.internetConnection.resolve(BBEXT.context);
                });
                $.when(BBEXT.globalObj.req).fail(function(a, b, thrownError) {
                        // console.log(b);
                        _gaq.push(['_trackEvent', 'Errors', 'EXTERR', 'FAILWHOAMI - probebly offline check Ext_offline actions' + b, 1]);
                        self.status = 'EXTERR';
                        selfcore.callwhoami(count + 1);
                });
        };
        selfcore.setversion = function(ctx) {
                ctx = ctx || BBEXT.context;
                if(typeof localStorage.extver === 'undefined' || localStorage.extver !== BBEXT.objmanifest.version) {
                        _gaq.push(['_trackPageview', '/extension/Extension_update/' + BBEXT.objmanifest.version]);
                        _gaq.push(['_trackEvent', 'Funnel', 'Extension_update', 'UPDATE FROM VERSION: ' + localStorage.extver + ' TO: ' + BBEXT.objmanifest.version, 1]);
                        localStorage.extver = BBEXT.objmanifest.version;
                        BBEXT.bbga.setCustomVarSession(ctx);
                }
        };
        selfcore.exeAllscript = function(tabo, execounter, url, cb) {
                cb = cb ||
                function() {
                        BBEXT.ux.initBrowserAction(tabo, url);
                };
                chrome.tabs.executeScript(tabo.id, {
                        file: BBEXT.objmanifest.content_scripts[0].js[execounter]
                }, function() {
                        if(execounter < BBEXT.objmanifest.content_scripts[0].js.length - 1) {
                                execounter++;
                                selfcore.exeAllscript(tabo, execounter, url, cb);
                        } else if(execounter == BBEXT.objmanifest.content_scripts[0].js.length - 1) {
                                cb();
                        }
                });
        };
        // *************************************************************************** INJECT CSS STYLE FROM MANIFEST *****************
        selfcore.exeAllstyle = function(tabid, execounter) {
                chrome.tabs.insertCSS(tabid, {
                        file: BBEXT.objmanifest.content_scripts[0].css[execounter]
                }, function() {
                        if(execounter < BBEXT.objmanifest.content_scripts[0].css.length - 1) {
                                execounter++;
                                selfcore.exeAllstyle(tabid, execounter);
                        }
                });
        };
        selfcore.callUserActionStatus = function(actname) {
                BBEXT.globalObj.userStatusConnected = $.Deferred();
                BBEXT.globalObj.userIsConnected = $.Deferred();
                if(BBEXT.context.status === 'NOSDKAUTH' && BBEXT.globalObj.sdkblocker > 1) {
                        BBEXT.proxy.clearesolve();
                } else {
                        BBEXT.globalObj.sdkblocker = 2;
                        BBEXT.proxy.setRequest({
                                method: 'bbfbstatus'
                        }, 'userActionStatus');

                }

                $.when(BBEXT.globalObj.userStatusConnected).done(function(res) {
                        console.log('BBEXT.globalObj.userStatusConnected resolved with status = ', res);
                        if(res) {
                                BBEXT.globalObj.userIsConnected.resolve(actname);
                        } else {
                                selfcore.callallowpopup(actname);
                        }
                        return res;
                });
        };
        selfcore.callallowpopup = function(actname) {
                var url = "https://www.facebook.com/dialog/oauth?client_id=" + localStorage.fbappid + "&redirect_uri=" + localStorage.destserver + "/static/switchUserPopup.html&scope=" + localStorage["fbprem"] + "&response_type=token";
                chrome.windows.create({
                        url: url,
                        left: 150,
                        top: 150,
                        focused: true,
                        type: 'panel',
                        width: 1040,
                        height: 580
                }, function(popbbextwindow) {
                        _gaq.push(['_trackPageview', '/extension/Ext_Allow_Popoup/' + actname]);
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_Allow_Popoup', 'User name / Paircode : ' + BBEXT.context.bb_users.current + ', action' + actname, 1]);
                        BBEXT.globalObj.fbloginwindowid = popbbextwindow.id;
                });
                BBEXT.globalObj.globalactionname = actname;
        };

        selfcore.checkconnectionstatus = function() {
                function updateOnlineStatus(msg) {
                        var condition = navigator.onLine ? "ONLINE" : "OFFLINE";
                        if(navigator.onLine) {
                                BBEXT.defconnectionstat.resolve();
                        }
                }
                updateOnlineStatus("load");
                document.body.addEventListener("offline", function() {
                        updateOnlineStatus("offline");
                }, false);
                document.body.addEventListener("online", function() {
                        updateOnlineStatus("online");
                }, false);

        };
};
BBEXT.core = new BBoneCore();

BBoneUX = function() {
        var thisux = this;
        // *************************************************************************** ANIMATE browserAction ICON *****************
        thisux.animateicon = function(tab) {
                clearInterval(window.animaint);
                chrome.browserAction.setBadgeBackgroundColor({
                        tabId: tab.id,
                        color: [200, 10, 20, 155]
                });
                var i = 0;
                window.animaint = setInterval(function() {
                        i++;
                        i = (i > 4) ? 1 : i;
                        try {
                                chrome.browserAction.setIcon({
                                        path: 'img/aniaction/favicon' + i + '.png',
                                        tabId: tab.id
                                });
                        } catch(err) {
                                clearInterval(window.animaint);
                                console.log('CLOSED TAB', err);
                        }
                }, 120);
                window.restTime = setTimeout(function() {
                        try {
                                chrome.browserAction.setIcon({
                                        path: 'img/bigrboxExtIcon.png',
                                        tabId: tab.id
                                });
                        } catch(err) {
                                clearInterval(window.animaint);
                                console.log('CLOSED TAB', err);
                        }
                        try {
                                chrome.browserAction.setBadgeText({
                                        tabId: tab.id,
                                        text: ''
                                });
                        } catch(err) {
                                clearInterval(window.animaint);
                                console.log('CLOSED TAB', err);
                        }

                        clearInterval(window.animaint);
                        clearTimeout(window.restTime);
                }, 5000);
        };
        // *************************************************************************** RESET browserAction ICON *****************
        thisux.resetBaction = function(tid) {
                clearInterval(window.animaint);
                try {
                        chrome.tabs.get(tid, function(tab) {
                                chrome.browserAction.setIcon({
                                        path: 'img/bigrboxExtIcon.png',
                                        tabId: tid
                                });
                        });
                } catch(err) {
                        console.log(err);
                }

        };


        // *************************************************************************** browserAction *****************
        thisux.initBrowserAction = function(tabobj, url) {
                try {
                        thisux.animateicon(tabobj);
                        chrome.browserAction.setBadgeText({
                                tabId: tabobj.id,
                                text: ''
                        });


                        var code = function(url) {
                                        if(typeof BBEXT === 'undefined') {
                                                // reinit the content-script
                                                chrome.extension.sendRequest({
                                                        'msg_type': 'method',
                                                        'method': 'initContentScript',
                                                        'url': url
                                                }, function(response) {});
                                                return;
                                        }

                                        $(function() {
                                                setTimeout(function() {
                                                        BBEXT.globalObj.scrapefinished = true;
                                                        BBEXT.globalObj.btntrigger = true;
                                                        BBEXT.scrapper.externalScrapVideos();
                                                }, 200);
                                        });
                                };

                        if(!url) { // regular "old-button" action (open the player with videos from the active tab)
                                chrome.tabs.executeScript(tabobj.id, {
                                        code: "(function(){" + "(" + code + ")();" + "})()"
                                }, function() {
                                        if(chrome.extension.lastError) {
                                                alert('Could not activate Moovu on this page.');
                                                chrome.extension.lastError = undefined;
                                        }
                                });

                        } else {
                                if(url) { // we have the exact url to open the player with
                                        code = function(url) {
                                                if(typeof BBEXT === 'undefined') {
                                                        // reinit the content-script
                                                        chrome.extension.sendRequest({
                                                                'msg_type': 'method',
                                                                'method': 'initContentScript',
                                                                'url': url
                                                        }, function(response) {});
                                                        return;
                                                }

                                                $(function() {
                                                        setTimeout(function() {
                                                                try {
                                                                        BBEXT.ytServices.pauseVideo();
                                                                } catch(x) {

                                                                }
                                                                //BBEXT.globalObj.btntrigger = true;
                                                                BBEXT.overlay.open_player_overlay(url);

                                                        }, 200);
                                                });
                                        };
                                        chrome.tabs.executeScript(tabobj.id, {
                                                code: "(function(){" + "(" + code + ")('" + url + "');" + "})()"
                                        }, function() {
                                                if(chrome.extension.lastError) {
                                                        alert('Could not activate Moovu on this page.');
                                                        chrome.extension.lastError = undefined;
                                                }
                                        });
                                }
                        }

                } catch(err) {
                        console.log('NO CAN DO', err);
                }
        };
};
BBEXT.ux = new BBoneUX();
BBoneProxy = function() {
        var selfpx = this;
        selfpx.sendMessage = function(msgobj) {
                var o = document.getElementById('bbauth');
                o.contentWindow.postMessage(msgobj, localStorage.destserver + '/fbproxy');
        };
        selfpx.setRequest = function(msgobj, callername, cb) {
                msgobj = msgobj || 'NOMSG';
                callername = callername || 'NOCALLER';
                BBEXT.globalObj.liveproxy = false;
                try {
                        BBEXT.globalObj.proxytimer = setTimeout(function() {
                                selfpx.isalive('request from - ' + callername);
                        }, 30000);
                        selfpx.sendMessage(msgobj);
                } catch(err) {
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_proxy_message_failed', 'Couldnt send message. Caller is: ' + callername + ' error:' + err, 1]);
                        BBEXT.globalObj.proxytimer = setTimeout(function() {
                                selfpx.isalive('request error - ' + callername);
                        }, 30000);
                }
        };
        selfpx.setSeniorCookie = function(cookiedata) {
                selfpx.sendMessage({
                        method: 'bbsetextdata',
                        param: cookiedata
                }, 'setSeniorCookie');
        };
        selfpx.getfbtoken = function(cbname) {
                selfpx.sendMessage({
                        method: 'bbgetaccesstoken',
                        param: {
                                cb: cbname
                        }
                }, cbname);
        };
        selfpx.reciveCookie = function(cookieobj) {};
        selfpx.requestCookie = function() {
                selfpx.setRequest({
                        method: 'bbgetextdata',
                        param: {
                                name: 'bbextdata',
                                cb: 'reciveCookie'
                        }
                }, 'setSeniorCookie');
        };
        selfpx.receiver = function(e) {
                clearTimeout(BBEXT.globalObj.proxytimer);
                BBEXT.globalObj.liveproxy = true;
                if(e.data && typeof e.data === 'object' && e.data.method) {
                        console.log('background got message: ' + e.data.method + ' ' + e.origin);
                        BBEXT.bg_services[e.data.method](e.data.param);
                } else {
                        selfpx.setStatus(e);
                }
        };
        selfpx.setiframesrc = function(caller) {
                // console.log(caller,localStorage.destserver);
                if(BBEXT.globalObj.sdkblocker < 3) {
                        $('#bbauth').attr('src', localStorage.destserver + '/fbproxy');
                        BBEXT.globalObj.sdkblocker++;
                        BBEXT.globalObj.proxytimer = setTimeout(function() {
                                selfpx.isalive(caller);
                        }, 30000);
                }
        };
        selfpx.isalive = function(caller) {
                if(!BBEXT.globalObj.liveproxy) {
                        console.log('RELOAD THE PROXY TRY AGAIN WITH SRC = ' + localStorage.destserver + '/fbproxy ' + caller + ' #' + BBEXT.globalObj.sdkblocker + ' Version:' + BBEXT.objmanifest.version);
                        BBEXT.proxy.setiframesrc(caller);
                }
        };
        selfpx.clearesolve = function(stat) {
                BBEXT.globalObj.userStatusConnected.resolve(stat);
        };
        selfpx.setStatus = function(packetmsg) {

                if(!BBEXT.globalObj.internetConnection.isResolved()) {
                        BBEXT.globalObj.internetConnection.resolve(packetmsg.data);
                }
                console.log('GOT MESSAGE: ', packetmsg.data);
                var statresult = false;
                if(packetmsg && (packetmsg.data.status === 'connected' || packetmsg.data.status === 'NOSDKAUTH')) { //USER IS CONNECTED
                        statresult = true;
                        BBEXT.bbga.setConnectedCustomVar(packetmsg.data);
                        if(!BBEXT.context) { // USER HAS NO COOKIE
                                BBEXT.bbga.setSession(packetmsg.data);
                                // _gaq.push(['_trackEvent', 'Funnel', 'Ext_Returning_User', 'USER HAS NO CONTEXT (WHO AM I FAILD?)- ' + packetmsg.data.bb_users.current + ', config: ' + packetmsg.data.config + ', userID: ' + packetmsg.data.userID, 1]);
                        } else if(BBEXT.context.bb_users.current !== packetmsg.data.bb_users.current) { //CONTEXT ALREADY EXIST COMPARE IF THERE WAS A SWITCH
                                if(packetmsg.data.new_user) { // NEW USER
                                        BBEXT.globalObj.globalactionname = BBEXT.globalObj.globalactionname || 'NOACTION';
                                        _gaq.push(['_trackPageview', '/extension/User_Is_Allowed/' + BBEXT.globalObj.globalactionname]);
                                        _gaq.push(['_trackEvent', 'Funnel', 'User_Is_Allowed', 'Where EXT: ' + packetmsg.data.bb_users.current, 1]);
                                } else { // USER SWITCH
                                        // _gaq.push(['_trackEvent', 'Funnel', 'Ext_switch_user_popup', 'Switched from: ' + BBEXT.context.bb_users.current + ', to: ' + packetmsg.data.bb_users.current, 1]);
                                }
                        } else {
                                // _gaq.push(['_trackEvent', 'Funnel', 'Ext_User_uptodate', BBEXT.context.bb_users.current + ' was already connected', 1]);
                        }
                        BBEXT.context = packetmsg.data;
                        selfpx.clearesolve(statresult);
                } else if(packetmsg.data.error) {
                        BBEXT.context = packetmsg.data;
                        if(BBEXT.globalObj.sdkblocker < 2) {
                                _gaq.push(['_trackEvent', 'Funnel', 'Ext_proxy_error', packetmsg.data.error + ' #' + BBEXT.globalObj.sdkblocker + ' Version:' + BBEXT.objmanifest.version, 1]);
                        } else {
                                selfpx.clearesolve(statresult);
                        }
                } else {
                        BBEXT.context = packetmsg.data;
                        BBEXT.bbga.setConnectedCustomVar(packetmsg.data);
                        selfpx.clearesolve(statresult);
                }
                BBEXT.defcontext.resolve();
                BBEXT.bbga.keepalivetimeout();
                localStorage.invitedlist = BBEXT.context.config;
        };
        selfpx.getstream = function() {
                selfpx.setRequest({
                        method: 'bbgetstream',
                        param: {
                                cb: 'pushstreamsg'
                        }
                }, 'getstream');
        };

        selfpx.getfbstat = function() {
                selfpx.setRequest({
                        method: 'bbfbstatus',
                        param: {
                                cb: 'gotfbstat'
                        }
                }, 'getfbstat');
        };


        selfpx.getmix = function(cbname) {
                // var today = BBEXT.extUtils.ddmmyyyy();
                selfpx.setRequest({
                        method: 'bbgetmix',
                        param: {
                                cb: cbname
                        }
                }, 'getmix.' + cbname);
        };


};
BBEXT.proxy = new BBoneProxy();
Bg_services = function() {
        var selfservice = this;
        selfservice.setplayerHash = function(boxingdata, lastwatch, bbref, pt) {
                pt = pt || 'hash';
                var paramlastwatch;
                //{"fbid":"alfred.baggio","pagename":{"actor":"Rosh Bakier","location":"Facebook"},"fbpageimg":"https://fbexternal-a.akamaihd.net/safe_image.php?d=AQDSgWM-dosCeVhd&w=200&h=200&url=http%3A%2F%2Fimg.youtube.com%2Fvi%2FTQzyfvTlBN0%2F0.jpg&crop"
                // if(lastwatch.length === 11) {
                //         paramlastwatch = '&lastWatched=' + lastwatch;
                // } else {
                //         paramlastwatch = '';
                // }
                paramlastwatch = '&lastWatched=' + lastwatch;
                bbref = "embed" + bbref;
                var hashstr = {
                        message: 'newdata',
                        bbref: bbref,
                        lastWatched: lastwatch,
                        playlist: boxingdata
                };
                hashstr = encodeURIComponent(JSON.stringify(hashstr));
                // console.log('hashstr', hashstr);
                return BBEXT.objmanifest.destserver + '/box/party?bbref=' + bbref + '&pt=' + pt + paramlastwatch + '#' + hashstr;

        };
        selfservice.google_analytics_event = function(req, sender, cb) {
                BBEXT.bbga.sendGAnalytics(req);
        };
        selfservice.ext_statistics = function(req, sender, cb) {
                BBEXT.bbga.sendGAnalytics(req);
                //SPECIAL HANDLER FOR EXTENSION STATISTICS USER HISTORY TRACKING FUTURE DEVELOPMENT
        };
        selfservice.callbbunfollow = function(req, sender, cb) {
                BBEXT.core.callUserActionStatus('follow');
                BBEXT.globalObj.userIsConnected.done(function() {
                        selfservice.deffollowres = $.Deferred();
                        BBEXT.proxy.setRequest({
                                method: 'bbunfollow',
                                param: {
                                        cb: 'setfollowed',
                                        fbid: req.fbid
                                }
                        }, 'bbfollowunfollow');
                        selfservice.deffollowres.done(function(resobj) {
                                cb(resobj);
                        });
                }).fail(function() {
                        cb('cancelallow');
                });


        };
        selfservice.trendinglandingpage = function(req, sender, cb) {
                BBEXT.ux.initBrowserAction(sender.tab, req.trendingurl);
        };
        selfservice.unrulymsg = function(req, sender, cb) {
                console.log(req, sender);
                // var thiscode = function(msg, param) {
                //                 console.log('unrulymsg***********************************', msg, param);
                //                 $(document).trigger('unrulymsg', [msg]);
                //         };
                // chrome.tabs.executeScript(sender.tab.id, {
                //         code: "(function(){" + "(" + thiscode + ")('" + req.param + "');" + "})()"
                // });
        };
        selfservice.callbbfollow = function(req, sender, cb) {
                BBEXT.core.callUserActionStatus('follow');
                BBEXT.globalObj.userIsConnected.done(function() {
                        selfservice.deffollowres = $.Deferred();
                        BBEXT.proxy.setRequest({
                                method: 'bbfollow',
                                param: {
                                        cb: 'setfollowed',
                                        fbid: req.fbid
                                }
                        }, 'bbfollowunfollow');
                        selfservice.deffollowres.done(function(resobj) {
                                if(resobj.invitedlist.indexOf(req.fbid)) {
                                        cb(resobj);
                                } else {
                                        cb(false);
                                }
                        });
                }).fail(function() {
                        cb('cancelallow');
                });
        };

        selfservice.setfollowed = function(req, sender, cb) {
                localStorage.invitedlist = req;
                var followobj = {
                        status: BBEXT.bg_services.getStatus(),
                        invitedlist: req
                };
                selfservice.deffollowres.resolve(followobj);
        };

        selfservice.pingalive = function(req, sender, cb) {
                cb(true);
        };

        selfservice.setiframesrc = function(req, sender, cb) {
                console.log('saved options', req);
                BBEXT.proxy.setiframesrc('OPTIONS');
                BBEXT.objmanifest.destserver = req.dstsrv;
                BBEXT.objmanifest.fbappid = req.fbappid;
                cb(true);
        };
        selfservice.closeWindow = function(req, sender, cb) {
                chrome.windows.remove(BBEXT.globalObj.fbloginwindowid, function() {
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_Auto_Close_Allow_Popup', ', Extension User is Allowed', 1]);
                });
        };
        selfservice.shorty = function(req, sender, cb) {
                selfservice.get_fullurl(req.shorty, req.elem, cb);
        };
        selfservice.streamRequest = function(req, sender, cb) {
                cb(JSON.parse(localStorage.streaMsg));
        };

        selfservice.getparams = function(req, sender, cb) {
                var params = {
                        'destserver': localStorage.destserver,
                        'pushMsgStat': localStorage.pushMsgStat,
                        'gaccount': BBEXT.objmanifest.gaccount
                };
                if(sender.tab.url.match('facebook.com')) {
                        params.invitedlist = localStorage.invitedlist;
                }
                console.log('getparams', localStorage.destserver, BBEXT.objmanifest.destserver);
                cb(params);
        };

        selfservice.injectscript = function(req, sender, cb) {
                chrome.tabs.executeScript(sender.tab.id, {
                        file: req.filename
                }, cb('OK SCRIPT INJECTED', req.filename));
        };
        selfservice.injectCSS = function(req, sender, cb) {
                chrome.tabs.insertCSS(sender.tab.id, {
                        file: req.filename
                }, cb);
        };
        selfservice.popbbextpanel = function(request, sender, cb) {
                if(request.url.indexOf('box/party') !== -1) {
                        chrome.windows.create({
                                url: request.url,
                                left: 150,
                                top: 150,
                                focused: true,
                                type: 'panel',
                                width: 1040,
                                height: 580
                        }, function(fbloginwindow) {
                                cb(fbloginwindow);
                        });
                }
        };
        selfservice.initContentScript = function(request, sender, cbfinish, cbafter) {
                BBEXT.core.exeAllstyle(sender.tab.id, 0);
                BBEXT.core.exeAllscript(sender.tab, 0, request.url, cbafter);
                cbfinish('start on ==  ' + sender.tab.id);
        };

        selfservice.sortbytaste = function(taste, pl) {
                var td = BBEXT.extUtils.ddmmyyyy(new Date());
                var d = BBEXT.extUtils.ddmmyyyy(new Date().getTime() - 86400000);
                var mixbytaste = [];
                var mixbymix = [];
                var finres = [];
                var mixtasteobj = {};
                var catfilterpl = {};
                var tasteprecent = 0;
                var totaltagsmatch = 0;
                var totaltagstoday = 0;
                var mixprecent = 0;
                var mixlength = 15;
                if(Object.keys(taste).length > 0) {
                        $.each(pl, function(x, lastvid) {
                                lastvid = JSON.parse(lastvid);
                                if(lastvid && (lastvid.date === d || lastvid.date === td)) {
                                        $.each(lastvid.tags, function(tag, x) {
                                                tag = tag.toLowerCase().split('.');
                                                $.each(tag, function(x, splitag) {
                                                        if(catfilterpl[splitag]) {
                                                                catfilterpl[splitag].vids.push(lastvid);
                                                        } else {
                                                                catfilterpl[splitag] = {
                                                                        vids: [lastvid]
                                                                };
                                                        }
                                                });
                                        });
                                }
                        });
                        totaltagstoday = Object.keys(catfilterpl).length;
                        if(taste['the mix']) delete taste['the mix'];
                        $.each(taste, function(xtag, w) {
                                if(!catfilterpl[xtag] || !catfilterpl[xtag].vids[0]) return;
                                var lastvid = catfilterpl[xtag].vids[0];
                                totaltagsmatch += 1;
                                if(!lastvid) return;
                                lastvid.taste = true;
                                if(mixtasteobj[lastvid.id] && mixtasteobj[lastvid.id].w) {
                                        mixtasteobj[lastvid.id].w += w;
                                        mixtasteobj[lastvid.id].box.w += w;
                                } else {
                                        lastvid.w = w;
                                        mixtasteobj[lastvid.id] = {
                                                w: w,
                                                box: lastvid
                                        };
                                }
                                for(i = 0; i < w; i++) {
                                        mixbytaste.push(lastvid.id);
                                }
                        });
                        if(BBEXT.context.paircode.indexOf('A') === 0) {
                                for(var i = 0; i < mixlength; i++) {
                                        var rndmember = Math.floor(Math.random() * mixbytaste.length);
                                        if(rndmember && mixbytaste[rndmember] && mixtasteobj[mixbytaste[rndmember]] && !mixtasteobj[mixbytaste[rndmember]].added) {
                                                mixtasteobj[mixbytaste[rndmember]].added = true;
                                                finres.push(JSON.stringify(mixtasteobj[mixbytaste[rndmember]].box));
                                                mixbytaste.remove(mixbytaste[rndmember]);
                                        }
                                }
                        } else {
                                var sortable = [];
                                for(var vid in mixtasteobj) {
                                        sortable.push([vid, mixtasteobj[vid].w]);
                                }
                                sortable.sort(function(a, b) {
                                        return b[1] - a[1];
                                });
                                for(var z = 0; z < sortable.length; z++) {
                                        finres.push(JSON.stringify(mixtasteobj[sortable[z][0]].box));
                                }
                        }

                        tasteprecent = Math.round(finres.length / mixlength * 100);
                }
                if(finres.length < mixlength) {
                        mixprecent = finres.length;
                        mixbymix = BBEXT.action.filterPL('THE MIX', pl);
                        $.each(mixbymix, function(x, mixbox) {
                                mixbox = JSON.parse(mixbox);
                                if(mixtasteobj[mixbox.id]) return;
                                mixbox.mix = true;
                                // mixtasteobj[mixbox.id].tags = mixbox;
                                mixtasteobj[mixbox.id] = {
                                        box: mixbox,
                                        added: true
                                };
                                finres.push(JSON.stringify(mixbox));
                                if(finres.length > mixlength) return false;
                        });
                        mixprecent = Math.round((mixlength - mixprecent) / mixlength * 100);
                }
                console.log('FINALE result for mix of that user:', finres.length, mixtasteobj);
                var sortres = {
                        mixtasteobj: mixtasteobj,
                        mixtaste: finres,
                        mixprec: mixprecent,
                        tasteprec: tasteprecent,
                        totaltagsmatch: totaltagsmatch,
                        mnytags: totaltagstoday
                };
                return sortres;
        };

        /*selfservice.saveplaylist = function(req, sender, cb) {
                selfservice.savedshortcutplaylist = function(plparam) {
                        cb(plparam);
                        console.log('savetplres', plparam);
                };
                req.param.cb = 'savedshortcutplaylist';
                BBEXT.proxy.setRequest({
                        method: 'bbsave',
                        param: req.param
                }, 'savedshortcutplaylist');
        };*/
        selfservice.clicksaveplaylist = function(req, sender, cb) {
                var plobj = localStorage.viewactionparams;
                plobj = JSON.parse(plobj);
                plobj.lastWatched = plobj.hash.lastWatched = req.lw;
                plobj.hash.id = req.lw;
                plobj.metapic = req.pic;
                plobj.metanumber = '... and other trending videos';
                plobj.metatitle = req.title;
                selfservice.savedplaylist = function(plparam) {
                        if(plparam) {
                                cb(plparam);
                                _gaq.push(['_trackEvent', 'Web_user_engagment', 'Ext_savedplaylist', plobj.pid + ' lable:' + plobj.hash.tastelable, 1]);
                                console.log('savetplres', plparam);
                        } else {
                                _gaq.push(['_trackEvent', 'Web_user_engagment', 'Ext_failedsavepl', plobj.pid + ' lable:' + plobj.hash.tastelable, 1]);
                                console.log('savetplres', plparam);
                        }
                };
                plobj.cb = 'savedplaylist';
                BBEXT.proxy.setRequest({
                        method: 'bbsave',
                        param: plobj
                }, 'savedplaylist');
        };

        selfservice.setmixmsg = function(todaysmix, callerbbref, limitbymatch) {
                callerbbref = callerbbref || 'embedpushmsg';
                if(typeof todaysmix === 'object' && todaysmix.playlist && todaysmix.taste) {
                        BBEXT.context.taste = todaysmix.taste;
                        var tastecounter = 0;
                        var taste = JSON.parse(BBEXT.context.taste);
                        var tagscount = Object.keys(taste).length;
                        $.each(taste, function(x, y) {
                                tastecounter += y;
                        });
                        sortedobj = selfservice.sortbytaste(taste, todaysmix.playlist.reverse());
                        if(limitbymatch && sortedobj.tasteprec < 35) {
                                BBEXT.globalObj.msgDeff.reject();
                                return false;
                        }
                        filtered = sortedobj.mixtaste;
                        var lastwt = '';
                        if(BBEXT.globalObj.pushlastWatchedVids.indexOf(JSON.parse(filtered[0]).id) !== -1) {
                                filtered.shift();
                                $.each(filtered, function(x, boxingvid) {
                                        boxingvid = JSON.parse(boxingvid).id;
                                        if(BBEXT.globalObj.pushlastWatchedVids.indexOf(boxingvid) === -1) {
                                                BBEXT.globalObj.pushlastWatchedVids.push(boxingvid);
                                                return false;
                                        } else {
                                                filtered.shift();
                                        }
                                });
                        }
                        if(!JSON.parse(filtered[0]) || !JSON.parse(filtered[0]).id) {
                                BBEXT.globalObj.msgDeff.reject();
                                return false;
                        }
                        lastwt = '&lastWatched=' + JSON.parse(filtered[0]).id;
                        var newpid = 'CLNT_' + BBEXT.context.paircode + '-' + (new Date()).getTime();
                        var pt = escape('Today\'s Trending');
                        localStorage.mixPlaylist = BBEXT.objmanifest.destserver + '/box/party?pid=' + newpid + '&pt=' + pt + '&bbref=' + callerbbref + lastwt;
                        var taststrlable = '-tst-' + sortedobj.tasteprec + '-mix-' + sortedobj.mixprec + '-wght-' + tastecounter + '-tags-' + tagscount + '-tgmtch-' + sortedobj.totaltagsmatch + '-mnytags-' + sortedobj.mnytags + '-';
                        console.log(taststrlable);
                        var pushmixmsgObj = {
                                playlist: filtered,
                                player: JSON.parse(filtered[0]).player,
                                lastWatched: JSON.parse(filtered[0]).id,
                                id: JSON.parse(filtered[0]).id,
                                message: 'pushmixmsg',
                                link: localStorage.mixPlaylist,
                                mixtasteobj: sortedobj.mixtasteobj,
                                mixprec: sortedobj.mixprec,
                                tasteprec: sortedobj.tasteprec,
                                ttlwght: tastecounter,
                                tastecounter: tagscount,
                                totaltagsmatch: sortedobj.totaltagsmatch,
                                tastelable: taststrlable,
                                taste: BBEXT.context.taste
                        };
                        var defallVidInfo = $.Deferred().done(function(apiobj) {
                                var params = {
                                        hash: pushmixmsgObj,
                                        metapic: apiobj.picurl,
                                        metanumber: '... and other trending videos',
                                        metatitle: apiobj.title,
                                        pid: newpid,
                                        cb: 'savedplaylist'
                                };
                                localStorage.viewactionparams = JSON.stringify(params);
                                var msgObj = $.extend({}, pushmixmsgObj, apiobj);
                                BBEXT.globalObj.msgDeff.resolve(msgObj);
                        });
                        selfservice.getVidInfo(pushmixmsgObj, defallVidInfo);
                }
        };
        selfservice.addlastwtchedvids = function(req, sender, cb) {
                if(req) {
                        BBEXT.globalObj.lastWatchedVids.push(req.videoid);
                }
        };
        selfservice.setShownPlaylist = function(req, sender, cb) {
                try {
                        if(sender.tab.active) {
                                // console.log('req.videoid', req.videoid);
                                if(req.caller === 'Pushmsg' && req.videoid && req.action) {

                                        BBEXT.globalObj.pushlastWatchedVids.push(req.videoid);
                                        // console.log(req.videoid, BBEXT.globalObj.pushlastWatchedVids);
                                        var updatestat = JSON.parse(localStorage.pushMsgStat);
                                        updatestat[req.action] = {
                                                flag: true,
                                                stamp: (new Date().getTime())
                                        };

                                        localStorage.pushMsgStat = JSON.stringify(updatestat);
                                } else {
                                        selfservice.addlastwtchedvids(req.videoid, undefined, undefined);
                                }
                        } else {
                                if(req.caller === 'Pushmsg') {
                                        var tupdatestat = JSON.parse(localStorage.pushMsgStat);
                                        tupdatestat[req.action].flag = false;
                                        localStorage.pushMsgStat = JSON.stringify(tupdatestat);
                                }
                        }
                        cb(sender.tab.active);
                } catch(e) {
                        console.log('setShownPlaylist', e);
                }
        };
        selfservice.setppmsg = function(request, sender, cb) {
                if(BBEXT.extUtils.ddmmyyyy(parseInt(localStorage.installedate, 10)) === BBEXT.extUtils.ddmmyyyy(new Date().getTime()) && request.action !== 'getplaylist') return;
                var setDefforShow = function() {
                                BBEXT.globalObj.msgDeff = $.Deferred();
                                $.when(BBEXT.globalObj.msgDeff).done(function(plalistfeed) {
                                        cb(plalistfeed);
                                });
                        };
                if(localStorage.notifDate === 'never' || request.action === 'dontshowagain') {
                        localStorage.notifDate = 'never';
                        cb(false);
                        return false;
                }
                if(request.action === 'playlist') {
                        var tupdatestat = JSON.parse(localStorage.pushMsgStat);
                        tupdatestat.playlist.flag = true;
                        tupdatestat.playlistnight.flag = false;
                        localStorage.pushMsgStat = JSON.stringify(tupdatestat);
                        selfservice.setmixmsgday = function(tmix) {
                                tmix.taste = tmix.taste || '{}';
                                var tastecounter = 0;
                                var taste = JSON.parse(tmix.taste);
                                $.each(taste, function(x, y) {
                                        tastecounter += y;
                                });
                                if(tastecounter > 50) {
                                        selfservice.setmixmsg(tmix, 'embedpushmsgday', true);
                                }
                        };
                        setDefforShow();
                        BBEXT.proxy.getmix('setmixmsgday');
                } else if(request.action === 'playlistnight') {
                        selfservice.setmixmsgnight = function(tmix) {
                                tmix.taste = tmix.taste || '{}';
                                var tastecounter = 0;
                                var taste = JSON.parse(tmix.taste);
                                $.each(taste, function(x, y) {
                                        tastecounter += y;
                                });
                                if(tastecounter > 50) {
                                        selfservice.setmixmsg(tmix, 'embedpushmsgnight', true);
                                }
                        };
                        var vupdatestat = JSON.parse(localStorage.pushMsgStat);
                        vupdatestat.playlistnight.flag = true;
                        vupdatestat.playlist.flag = false;
                        localStorage.pushMsgStat = JSON.stringify(vupdatestat);
                        setDefforShow();
                        BBEXT.proxy.getmix('setmixmsgnight');
                } else if(request.action === 'weeklyplaylist') {
                        var weekstat = JSON.parse(localStorage.pushMsgStat);
                        weekstat.weeklyplaylist = (new Date().getTime());
                        localStorage.pushMsgStat = JSON.stringify(weekstat);
                        selfservice.setmixmsgweek = function(tmix) {
                                tmix.taste = tmix.taste || '{}';
                                selfservice.setmixmsg(tmix, 'embedpushweek');
                        };
                        setDefforShow();
                        BBEXT.proxy.getmix('setmixmsgweek');
                } else if(request.action === 'getplaylist') {
                        selfservice.setskipmixmsg = function(tmix) {
                                tmix.taste = tmix.taste || '{}';
                                var tastecounter = 0;
                                var taste = JSON.parse(tmix.taste);
                                selfservice.setmixmsg(tmix, 'embedpushpop');
                        };
                        setDefforShow();
                        BBEXT.proxy.getmix('setskipmixmsg');

                } else {
                        cb(false);
                }
        };
        selfservice.fetchvidsdata = function(req, sender, cb) {
                var vidsDef = [];
                for(var i = 0; i < req.playlist.length; i++) {
                        var defvid = $.Deferred();
                        vidsDef.push(defvid);
                        var vidbox = '';
                        try {
                                vidbox = JSON.parse(playlist[index]);
                        } catch(x) {
                                defvid.resolve(false);
                        }
                        selfservice.getVidInfo(vidbox, defvid);
                        // playlist.splice(index, 1);
                }
                setTimeout(function() {
                        $.each(vidsDef, function(i, dfrr) {
                                dfrr.resolve(false);
                        });
                }, 5000);
                $.when.apply(null, vidsDef).done(function() {
                        // $.each(arguments, appendvidthumb);
                        cb(arguments);
                });
        };
        selfservice.bgfetchvidinfo = function(req, sender, cb) {
                var videfrr = $.Deferred().done(function(vnfo) {
                        cb(vnfo);
                });
                // console.log('we got is:', req.vidbox.id);
                selfservice.getVidInfo(req.vidbox, videfrr);
        };
        selfservice.getVidInfo = function(vidbox, dfrr) {
                switch(vidbox.player) {
                case("youtube_player"):
                        var api_url = 'https://gdata.youtube.com/feeds/api/videos/' + vidbox.id + '?v=2&alt=json&callback=?';
                        $.ajax({
                                url: api_url,
                                cache: false,
                                dataType: 'json',
                                success: function(data) {
                                        vidbox.picurl = data.entry.media$group.media$thumbnail[1].url || '';
                                        vidbox.title = data.entry.title.$t || '';
                                        vidbox.desc = data.entry.media$group.media$description.$t || '';
                                        vidbox.player = "youtube_player";
                                        vidbox.host = "yt";
                                        // console.log('we got the the vid data', vidbox);
                                        dfrr.resolve(vidbox);
                                }
                        });
                        break;
                case("vimeo_player"):
                        $.getJSON('https://vimeo.com/api/v2/video/' + vidbox.id + '.json?callback=?', {
                                format: "json"
                        }, function(json) {
                                if(!json || json.length === 0 || !json[0].user_portrait_small) {
                                        return;
                                }
                                vidbox.picurl = json[0].thumbnail_large;
                                vidbox.title = json[0].title;
                                vidbox.desc = json[0].description || '';
                                vidbox.player = "vimeo_player";
                                vidbox.host = "vimeo";
                                dfrr.resolve(vidbox);
                        });
                        break;
                }
        };
        selfservice.setActionInfo = function(actionObj, defVidInfo) {
                var apiDef = $.Deferred();
                $.when(apiDef).done(function(apiobj) {
                        var apiresdata = {
                                action: 'likes',
                                pid: 'CLNT@' + BBEXT.context.uid,
                                metatitle: apiobj.title,
                                metanumber: '... and other videos on this channel',
                                metapic: apiobj.picurl,
                                lastWatched: actionObj.id,
                                type: 'object',
                                sep: '.',
                                nameSpace: 'og'
                        };
                        defVidInfo.resolve(apiresdata);
                });
                selfservice.getVidInfo(actionObj, apiDef);
        };
        selfservice.watch_later = function(request, sender, cb) {
                BBEXT.context = BBEXT.context || 'NOCONTEXT';
                $.when(BBEXT.globalObj.userIsConnected).done(function(actname) {
                        if(request.boxing.indexOf('id') !== -1) {
                                $.post(localStorage.destserver + '/playlist', {
                                        boxingJson: request.boxing,
                                        when_to_play: "watch_later"
                                }, function(resp) {
                                        var usern;
                                        try {
                                                usern = JSON.stringify(BBEXT.context);
                                                if(BBEXT.context.bb_users && BBEXT.context.bb_users.current) {
                                                        usern = BBEXT.context.bb_users.current;
                                                }
                                        } catch(err) {
                                                console.log(err);
                                        }
                                        var reqhstname = sender.tab.url;
                                        _gaq.push(['_trackEvent', 'Web_user_engagment', 'Ext_watch_later', resp + ' url:' + sender.tab.url, 1]);
                                        try {
                                                reqhstname = reqhstname.replace(/https:\/\/|http:\/\//g, '').split('/')[0];
                                        } catch(e) {
                                                reqhstname = sender.tab.url;
                                        }
                                        BBEXT.bbga.setCustomVarHostname(reqhstname);
                                        var defVidInfo = $.Deferred();
                                        $.when(defVidInfo).done(function(data) {
                                                _gaq.push(['_trackPageview', '/extension/publish/' + data.action + '/' + data.lastWatched]);
                                                var o = document.getElementById('bbauth');
                                                o.contentWindow.postMessage({
                                                        method: 'bbpublish',
                                                        param: data
                                                }, localStorage.destserver + '/fbproxy');
                                        });
                                        console.log('watch_later_post: ' + resp + ' - User : ' + usern);
                                        var boxingdata = JSON.parse(request.boxing);
                                        if(boxingdata.tags.FAVORITES === 1) {
                                                _gaq.push(['_trackPageview', '/extension/FAVORITES']);
                                                selfservice.setActionInfo(boxingdata, defVidInfo);
                                        } else {
                                                _gaq.push(['_trackPageview', '/extension/watch_later']);
                                                defVidInfo.reject();
                                        }
                                        cb(resp);

                                });
                        } else {
                                console.log('Got no id to watch later: ', request.boxing);
                        }
                });
        };
        selfservice.firstURL = function(request, sender, cb) {
                cb(localStorage.firstURL);
        };
        selfservice.clearBadge = function(request, sender, cb) {
                clearInterval(window.animaint);
                BBEXT.ux.resetBaction(sender.tab.id);
        };

        selfservice.counterHash = {};

        selfservice.counter = function(request, sender, cb) {
                var ic = request.i;
                try {
                        selfservice.counterHash[sender.tab.id] = request.i;
                        chrome.tabs.get(sender.tab.id, function(tab) {
                                if(!tab.id) return;
                                chrome.browserAction.setBadgeText({
                                        tabId: tab.id,
                                        text: '' + ic
                                });
                        });

                } catch(err) {
                        console.log('setBadgeText', err);
                }
        };
        selfservice.userActionStatus = function(request, sender, cb) {
                request.actionname = request.actionname || 'NOACTION';
                var res = BBEXT.core.callUserActionStatus(request.actionname);
                cb(res);
        };
        selfservice.bbprxalive = function() {
                // clearTimeout(BBEXT.globalObj.proxytimer);
        };
        selfservice.keepalive = function(request, sender, cb) {
                var sendparam = {};
                sendparam.paircode = BBEXT.context ? BBEXT.context.paircode : 'nopaircode';
                if(BBEXT.context && BBEXT.context.sess) {
                        sendparam.session = BBEXT.context.sess;
                } else {
                        sendparam.session = 'nosession';
                }
                cb(sendparam);
        };
        selfservice.access_token = function(request, sender, cb) {
                BBEXT.context = BBEXT.context || 'NOCONTEXT';
                BBEXT.globalObj.userStatusConnected = $.Deferred();
                $.when(BBEXT.globalObj.userStatusConnected).done(function(res) {
                        if(res) {
                                BBEXT.globalObj.userIsConnected.resolve(BBEXT.globalObj.globalactionname);
                                _gaq.push(['_trackEvent', 'Funnel', 'Ext_Access_Token', 'User name : ' + BBEXT.context.bb_users.current + ', Access Token :' + request.token + ' url:' + sender.tab.url, 1]);
                        } else {
                                BBEXT.globalObj.userIsConnected.reject();
                                _gaq.push(['_trackEvent', 'Funnel', 'Ext_User_Cancel_Allow', 'User name: ' + BBEXT.context.bb_users.current + ' ,actionname = ' + BBEXT.globalObj.globalactionname + ' url:' + sender.tab.url, 1]);
                        }
                });
                if(!request.token) {
                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_User_Cancel_Allow', 'User name: ' + JSON.stringify(BBEXT.context) + ' ,actionname = ' + BBEXT.globalObj.globalactionname, 1]);
                        BBEXT.globalObj.userStatusConnected.resolve(false);
                } else if(BBEXT.context.error || BBEXT.context.status === 'NOSDKAUTH') {
                        BBEXT.proxy.setRequest({
                                method: 'bbfbtoken',
                                param: request.token
                        }, 'access_token');
                } else {
                        BBEXT.proxy.setRequest({
                                method: 'bbfbstatus'
                        }, 'userActionStatus');
                }
                cb(BBEXT.context);
        };
        selfservice.get_fullurl = function(shorturl, elemobj, resp) {
                if(!BBEXT.globalObj.bbscraped_list[shorturl]) {
                        if(shorturl.indexOf('moovu') !== -1) {
                                return;
                        }
                        shorturl = unescape(shorturl.replace('http://www.facebook.com/l.php?u=', ''));
                        shorturl = unescape(shorturl.replace('/l.php?u=', ''));
                        shorturl = shorturl.split('&h=')[0];
                        var ajaxtype = 'POST';
                        if(shorturl.indexOf('goo.gl') !== -1) {
                                ajaxtype = 'GET';
                        }
                        if(shorturl.indexOf('/pin') !== -1) {
                                console.log(shorturl);
                        }
                        $.ajax({
                                type: ajaxtype,
                                url: shorturl
                        }).done(function(data) {
                                try {
                                        var videoidname = data.search(/watch\?v=([\d\w-]{11})/g);
                                        var embedvidname = data.search(/youtube.com\/embed\/([\d\w-]{11})/g);
                                        var embedvimeo = data.search(/player.vimeo.com\/video\/([\d]{8})/g);
                                        var listvid = [];
                                        var videoidly;
                                        if(videoidname !== -1) {
                                                videoidly = data.substring(videoidname + 8, videoidname + 19);
                                        } else if(embedvidname !== -1) {
                                                videoidly = data.substring(embedvidname + 18, embedvidname + 29);
                                        } else if(embedvimeo !== -1) {
                                                videoidly = data.substring(embedvimeo + 23, embedvimeo + 31);
                                        } else {
                                                videoidly = false;
                                        }
                                        BBEXT.globalObj.bbscraped_list[shorturl] = {
                                                arrvid: listvid,
                                                vid: videoidly,
                                                elem: elemobj,
                                                shorty: shorturl
                                        };
                                        resp({
                                                arrvid: listvid,
                                                vid: videoidly,
                                                elem: elemobj,
                                                shorty: shorturl
                                        });
                                } catch(err) {
                                        console.log('get_fullurl VIDEO NOT FOUND ERROR: ' + err);
                                }
                        });
                } else {
                        BBEXT.globalObj.bbscraped_list[shorturl].elem = elemobj;
                        resp(BBEXT.globalObj.bbscraped_list[shorturl]);
                }
        };
        selfservice.getGraphObj = function(actorid, defcallback) {
                var dfrrtoken = $.Deferred();
                dfrrtoken.done(function(fbt) {
                        var url = 'https://graph.facebook.com/' + actorid + '?access_token=' + fbt;
                        $.ajax({
                                url: url,
                                dataType: 'json',
                                success: function(fbgraph) {
                                        defcallback.resolve(fbgraph);
                                },
                                error: function(fbgraph) {}
                        });
                });
                selfservice.gotfbtoken = function(fbt) {
                        dfrrtoken.resolve(fbt);
                };
                BBEXT.proxy.getfbtoken('gotfbtoken');
        };
        selfservice.bbhasmix = function(mixPlaylist) {
                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {
                        BBEXT.globalObj.bbactionbtn = true;
                        BBEXT.ux.initBrowserAction(tab[0], localStorage.mixPlaylist);
                });
        };
        selfservice.bbgotmix = function(mixPlaylist) {
                var thisbbref = selfservice.currentbbref || 'embedpoptrend';
                var thispt = selfservice.thispt || escape('Today\'s Trending');
                var filtered = BBEXT.action.filterPL('THE MIX', mixPlaylist.playlist.reverse());
                localStorage.mixPlaylist = BBEXT.objmanifest.destserver + '/box/party?pid=CLNT@MIX:THE+MIX&pt=' + thispt + '&bbref=' + thisbbref + '&lastWatched=' + JSON.parse(filtered[0]).id;
                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {
                        BBEXT.globalObj.bbactionbtn = true;
                        BBEXT.ux.initBrowserAction(tab[0], localStorage.mixPlaylist);
                });
        };
        selfservice.getmixplaylist = function(request, sender, cb) {
                selfservice.currentbbref = request.bbref || undefined;
                selfservice.thispt = request.pt || undefined;
                BBEXT.proxy.getmix('bbgotmix');
        };

        selfservice.callpoptrending = function(request, sender, cb) {
                BBEXT.action.popTrendingDialogInPlr();
        };

        selfservice.callpopfriends = function(request, sender, cb) {
                BBEXT.action.popFriends(request);
        };

        selfservice.getstreamsg = function(request, sender, cb) {
                localStorage.streaMsg = localStorage.streaMsg || false;
                cb(JSON.parse(localStorage.streaMsg));
        };
        selfservice.pushstreamsg = function(streamarr) {
                if(streamarr && streamarr.length > 0) {
                        if(streamarr.length > 50) {
                                streamarr = streamarr.splice(0, 50);
                        }
                        var defStreamvid = $.Deferred();
                        var defGraph = $.Deferred();
                        $.when(defGraph, defStreamvid).done(function(graphObj, vidinfores) {
                                vidinfores.action = 'stream';
                                graphObj.picture = 'https://graph.facebook.com/' + graphObj.id + '/picture';
                                var streamsgObj = vidinfores;
                                streamsgObj.graph = graphObj;
                                streamsgObj.streamlist = streamarr;
                                streamsgObj.playerurl = BBEXT.bg_services.setplayerHash(streamsgObj.streamlist, streamsgObj.id, 'stream', 'Videos You Follow');
                                localStorage.streaMsg = JSON.stringify(streamsgObj);
                                var codeobj = {
                                        code: "$(document).trigger('streamsgevent');"
                                };
                                chrome.tabs.query({
                                        active: true,
                                        currentWindow: true
                                }, function(t) {
                                        if(t[0] && !t[0].incognito && t[0].selected && t[0].url.match(/http(s|):\/\//)) {
                                                try {
                                                        chrome.tabs.executeScript(t.id, codeobj);
                                                        selfservice.addlastwtchedvids({
                                                                videoid: vidinfores.id
                                                        });
                                                } catch(e) {
                                                        console.log('error catched streamsg executescript', e);
                                                }
                                        }
                                });
                        });
                        $.each(streamarr, function(key, boxingvid) {
                                boxingvid = JSON.parse(boxingvid);
                                if(BBEXT.globalObj.lastWatchedVids.indexOf(boxingvid.id) === -1 && ((new Date().getTime() - boxingvid.fbtime) < 5600000)) {
                                        BBEXT.bg_services.getGraphObj(boxingvid.who_shared, defGraph);
                                        BBEXT.bg_services.getVidInfo(boxingvid, defStreamvid);
                                        return false;
                                }
                        });
                } else {
                        console.log('NOTHING NEW', streamarr);
                }
        };

        selfservice.getfbstat = function(req, sender, cb) {
                selfservice.gotfbstat = cb;
                BBEXT.proxy.getfbstat();
        };
        selfservice.streamonDemand = function(req, sender, cb) {
                BBEXT.proxy.getstream();
        };
        selfservice.openchatab = function(req, sender, cb) {
                chrome.tabs.create({
                        url: localStorage.chatserver + '/?rid='+req.vid
                }, function(newtab) {cb('OK',newtab);});
        };
        selfservice.streamMessaging = function(ctx) {
                if(ctx && ctx.status === 'connected') {
                        chrome.idle.queryState(30, function(e) {
                                if(e === "active") {
                                        chrome.tabs.query({
                                                active: true,
                                                currentWindow: true
                                        }, function(t) {
                                                if(t[0] && !t[0].incognito && t[0].selected && t[0].url.match(/http(s|):\/\//)) {
                                                        try {
                                                                BBEXT.proxy.getstream();
                                                        } catch(e) {
                                                                console.log('error catched call BBEXT.proxy.getstream()', e);
                                                        }
                                                }
                                        });

                                }
                        });
                }
                clearTimeout(selfservice.streamtimeout);
                selfservice.streamtimeout = setTimeout(function() {
                        selfservice.streamMessaging(BBEXT.context);
                }, 300000);
        };
        selfservice.getStatus = function() {
                return BBEXT.context.status;
        };
};
BBEXT.bg_services = new Bg_services();



BBoneAction = function() {
        var selfaction = this;

        // OPEN AYAL :
        selfaction.filterPL = function(f, pl) {
                pl = pl || BBEXT.context.currentPlaylist;
                if(!pl || pl.length === 0) {
                        return [];
                }
                return $.map(pl, function(box) {
                        return(JSON.parse(box).tags && JSON.parse(box).tags[f] > 0) ? box : null;
                });
        };


        selfaction.popThisPage = function() {
                _gaq.push(['_trackEvent', 'Web_user_engagment', 'click-pop-option', 'playpage', 1]);
                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {
                        BBEXT.globalObj.bbactionbtn = true;
                        BBEXT.ux.initBrowserAction(tab[0]);
                });
        };

        selfaction.popTrending = function() {
                _gaq.push(['_trackEvent', 'Web_user_engagment', 'click-pop-option', 'trending', 1]);
                // BBEXT.proxy.getmix('bbgotmix');
                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {
                        BBEXT.ux.animateicon(tab[0]);
                        chrome.browserAction.setBadgeText({
                                tabId: tab[0].id,
                                text: ''
                        });
                        chrome.tabs.executeScript(tab[0].id, {
                                code: "$(document).trigger('pushmsgevent', ['getplaylist', 1, 'PushmsgpopTrending']);"
                        });
                });


        };

        selfaction.popTrendingDialogInPlr = function() {
                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {
                        BBEXT.globalObj.bbactionbtn = true;
                        BBEXT.ux.initBrowserAction(tab[0], BBEXT.objmanifest.destserver + '/box/party?bbref=embedlandtrendbtn#' + encodeURIComponent(JSON.stringify({
                                message: 'init:poptrending',
                                param: '',
                                playlist: []
                        })));
                });
        };


        selfaction.popFriends = function(request) {
                _gaq.push(['_trackEvent', 'Web_user_engagment', 'click-pop-option', 'myfriends', 1]);
                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {
                        var bbref = 'embedfriends';
                        if(request && request.bbref) {
                                bbref = request.bbref;
                        }
                        BBEXT.globalObj.bbactionbtn = true;
                        var pt = escape('Today\'s Trending');
                        BBEXT.ux.initBrowserAction(tab[0], BBEXT.objmanifest.destserver + '/box/party?pt=' + pt + '&bbref=' + bbref + '#' + encodeURIComponent(JSON.stringify({
                                message: 'init:popfriends',
                                param: '',
                                playlist: []
                        })));
                });
        };

        selfaction.popVideosILiked = function() {
                _gaq.push(['_trackEvent', 'Web_user_engagment', 'click-pop-option', 'videos-i-liked', 1]);

                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {

                        BBEXT.globalObj.bbactionbtn = true;
                        // >>> not so relevant because the option is hidden in these cases >>>
                        if(!BBEXT.context.currentPlaylist || BBEXT.context.currentPlaylist.length === 0) {
                                alert('You have no videos in your "Videos I Liked" collection');
                                return;
                        } else {
                                var filtered = $.map(BBEXT.context.currentPlaylist, function(box) {
                                        return(JSON.parse(box).tags && JSON.parse(box).tags["FAVORITES"] > 0) ? box : null;
                                });
                                // >>> not so relevant because the option is hidden in these cases >>>
                                if(filtered.length === 0) {
                                        alert('You have no videos in your "Videos I Liked" collection.. Try collecting some!');
                                        return;
                                } else {
                                        var lw = '';
                                        //JSON.parse(filtered[filtered.length - 1]).id;
                                        BBEXT.ux.initBrowserAction(tab[0], BBEXT.objmanifest.destserver + '/box/party?pt=VIDEOS+I+LIKED&bbref=embed' + 'vidsliked' + (lw ? ('&lastWatched=' + lw) : '') + '#' + encodeURIComponent(JSON.stringify({
                                                message: 'init:videosLiked',
                                                param: '',
                                                playlist: []
                                        })));
                                }
                        }
                });
        };

        selfaction.popWatchLater = function() {
                _gaq.push(['_trackEvent', 'Web_user_engagment', 'click-pop-option', 'watchlater', 1]);

                chrome.tabs.query({
                        active: true,
                        currentWindow: true
                }, function(tab) {

                        BBEXT.globalObj.bbactionbtn = true;

                        // >>> not so relevant because the option is hidden in these cases >>>
                        if(BBEXT.context.status !== 'connected') {
                                BBEXT.core.callallowpopup('menu-watchlater');
                                return;
                        }

                        // >>> not so relevant because the option is hidden in these cases >>>
                        if(!BBEXT.context.currentPlaylist || BBEXT.context.currentPlaylist.length === 0) {
                                alert('You have no videos in your "Watch Later" collection');
                                return;
                        } else {
                                var filtered = $.map(BBEXT.context.currentPlaylist, function(box) {
                                        return(JSON.parse(box).tags && JSON.parse(box).tags["Watch Later"] > 0) ? box : null;
                                });
                                // >>> not so relevant because the option is hidden in these cases >>>
                                if(filtered.length === 0) {
                                        alert('You have no videos in your "Watch Later" collection.. Try collecting some!');
                                        return;
                                } else {
                                        var lw = '';
                                        //JSON.parse(filtered[filtered.length - 1]).id;
                                        BBEXT.ux.initBrowserAction(tab[0], BBEXT.objmanifest.destserver + '/box/party?pt=My+Watch+Later&bbref=embed' + 'watchlater' + (lw ? ('&lastWatched=' + lw) : '') + '#' + encodeURIComponent(JSON.stringify({
                                                message: 'init:watchLater',
                                                param: '',
                                                playlist: []
                                        })));
                                }
                        }
                });
        };
};
BBEXT.action = new BBoneAction();
BBoneInstall = function() {
        var selfinst = this;
        selfinst.openplaylistfirstime = function(ctx) {
                ctx = ctx || BBEXT.context;
                localStorage.firstRun = 'true';
                var d = new Date();
                var week = d.getTime();
                var today = BBEXT.extUtils.ddmmyyyy();
                localStorage.keepalivetoday = today;
                localStorage.keepaliveweek = week;
                localStorage.installedate = week;
                localStorage.extver = BBEXT.objmanifest.version;
                BBEXT.globalObj.firstRun = true;
                _gaq.push(['_trackPageview', '/extension/Extension_installed/' + BBEXT.objmanifest.version]);
                //var trackinstall = $.get('http://www.googleadservices.com/pagead/conversion/1009871720/?label=vdKtCJiH6AIQ6NbF4QM&guid=ON&script=0', function(data) {
                //console.log(data);
                //});
                //$.when(trackinstall).fail(function(a, b, thrownError) {
                //    _gaq.push(['_trackPageview', '/extension/googleadconversion/fail/' + BBEXT.objmanifest.version + '/' + ctx.bb_users.current]);
                //    console.log('TRACKING FAILD', a, b, thrownError);
                //});
                var redirecturl = '';
                var bbcurent = 'unknown';
                var ctxpair = 'unknown';
                var bbrefstr = 'unknown';
                if(ctx.bb_users.current) {
                        bbcurent = ctx.bb_users.current;
                }
                if(ctx.paircode) {
                        ctxpair = ctx.paircode;
                }
                var openOverlaywithURL = function() {
                                if(bbrefstr === 'homepage') {
                                        return false;
                                }
                                localStorage.firstURL = redirecturl;
                                localStorage.bbreforigin = bbrefstr;
                                localStorage.onextup = 'install';
                                chrome.tabs.create({
                                        url: localStorage.destserver + '/?bbref=extlandmood'
                                }, function(newtab) {});
                        };
                // console.log(BBEXT.objmanifest.destserver, '*************11111111************');
                chrome.tabs.query({
                        'url': BBEXT.objmanifest.destserver + '/*'
                }, function(tabr) {
                        // console.log(tabr, BBEXT.objmanifest.destserver, '*******11111112******************');
                        if(tabr[0] && tabr[0].url) {
                                console.log(tabr[0]);
                                BBEXT.bg_services.initContentScript('', {
                                        tab: tabr[0]
                                }, function(res) {
                                        console.log(res);
                                }, function() {
                                        console.log('after install');
                                });
                                _gaq.push(['_trackPageview', '/extension/installed/homepage/' + BBEXT.objmanifest.version]);
                                bbrefstr = 'homepage';
                        } else {
                                chrome.tabs.query({
                                        'url': '*://chrome.google.com/webstore/*'
                                }, function(tabarr) {
                                        if(tabarr[0] && tabarr[0].url) {
                                                if(tabarr[0].url.indexOf('extref=') !== -1) {
                                                        bbrefstr = BBEXT.extUtils.getParameterByName(tabr[0].url, 'extref');
                                                        _gaq.push(['_trackPageview', '/extension/installed/chromestore/' + BBEXT.objmanifest.version + '/' + bbrefstr]);
                                                        openOverlaywithURL();
                                                } else {
                                                        bbrefstr = 'chromestore';
                                                        _gaq.push(['_trackPageview', '/extension/installed/chromestore/' + BBEXT.objmanifest.version]);
                                                        openOverlaywithURL();
                                                }
                                        } else {
                                                chrome.tabs.query({
                                                        'url': '*://*/*pid=CLNT*bbref=share*'
                                                }, function(tabr) {
                                                        if(tabr[0] && tabr[0].url) {
                                                                bbrefstr = BBEXT.extUtils.getParameterByName(tabr[0].url, 'bbref');
                                                                _gaq.push(['_trackPageview', '/extension/installed/' + bbrefstr + '/' + BBEXT.objmanifest.version]);
                                                                redirecturl = tabr[0].url.substr(tabr[0].url.indexOf('?'));
                                                                redirecturl = localStorage.destserver + '/box/party' + redirecturl.replace('bbref=share', 'bbref=embed');
                                                                localStorage.firstURL = redirecturl;
                                                                if(tabr[0].url.indexOf('sharead') !== -1) {
                                                                        var subchannel = {};
                                                                        subchannel.pid = BBEXT.extUtils.getParameterByName(redirecturl, 'pid');
                                                                        subchannel.pic = BBEXT.extUtils.getParameterByName(redirecturl, 'metapic');
                                                                        subchannel.title = BBEXT.extUtils.getParameterByName(redirecturl, 'metatitle');
                                                                        subchannel.number = BBEXT.extUtils.getParameterByName(redirecturl, 'metanumber');
                                                                        localStorage.subscribedchannel = JSON.stringify(subchannel);
                                                                        _gaq.push(['_trackEvent', 'Funnel', 'Ext_install_sharead', 'reference=' + bbrefstr + ', ' + subchannel.title + ', ver - ' + BBEXT.objmanifest.version, 1]);
                                                                }
                                                                openOverlaywithURL();
                                                        } else {
                                                                // console.log('&&&&&&&&&&&&& errpage INSTALL = ',tabarr[0]);
                                                                _gaq.push(['_trackPageview', '/extension/installed/otherpage/' + BBEXT.objmanifest.version]);
                                                                bbrefstr = 'otherpage';
                                                                openOverlaywithURL();

                                                        }
                                                });
                                        }
                                });

                        }
                });



        };
};
BBEXT.install = new BBoneInstall();

function onRequest(request, sender, sendResponse) {
        if(request.msg_type === 'method') {
                BBEXT.bg_services[request.method](request, sender, sendResponse);
        }
}
/*chrome.runtime.onInstalled.addListener(function(details) {
        console.log(details);
});*/
chrome.extension.onRequest.addListener(onRequest);
window.addEventListener('message', BBEXT.proxy.receiver, false);
BBEXT.defconnectionstat = $.Deferred();
BBEXT.defconnectionstat.done(function() {
        BBEXT.defcontext.done(function() {
                BBEXT.bg_services.streamMessaging(BBEXT.context);
        });
        BBEXT.defManifest.done(function() {
                BBEXT.core.callwhoami(0);
        });

});

$(document).ready(function() {
        BBEXT.core.checkconnectionstatus();
});
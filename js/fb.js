FBStatus = $.Deferred();
FBLoggedIn = $.Deferred();
context = {appId: '468546183182071'};

window.setstat = function(resp) {
    FBStatus.resolve(resp.status);
    if (resp.status === 'connected') {
	FB.api('/me', function(resp){
		   window.name = resp.name;
		   FBLoggedIn.resolve(resp);
	       });
    }
    else {
	
    }
};

window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
		appId: context.appId,
		status: true,
		cookie: true,
		xfbml: true
	    });
    
    
    FB.getLoginStatus(function(resp) {
			  setstat(resp);
		      });
    
};

fblogin = function(cb) {
    FB.login(function(response) {
		 var whenAllowed = function(){
		     FBLoggedIn.done(cb);
		 };

		 if (response.authResponse) {
		     whenAllowed();
		     return; 
		 }

		 FB.init({
			     appId      :  context.appId,
			     status     : true, // check login status
			     cookie     : true, // enable cookies to allow the server to access the session
			     oauth      : true, // enable OAuth 2.0
			     xfbml      : true,  // parse XFBML
			     frictionlessRequests: true
			 });
		 
		 FB.getLoginStatus(function(response) {
				       if (response.authResponse) {
					   whenAllowed();
				       }
				       setstatus(response);
				   });

	     }, {scope: context.scope});
};

// Load the SDK's source Asynchronously
// Note that the debug version is being actively developed and might 
// contain some type checks that are overly strict. 
// Please report such bugs using the bugs tool.
(function(d, debug){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
 }(document, /*debug*/ false));

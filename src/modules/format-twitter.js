/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Globals
 */
(function ($, undefined) {
	"use strict"; // Yeah, we are that crazy
	
	
	var twitterlink = function(t) {
        return t.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=]+[^:\.,\)\s*$])/ig, function(m, link) {
          return '<a title="' + m + '" href="' + m + '" target="_blank">' + ((link.length > 36) ? link.substr(0, 35) + '&hellip;' : link) + '</a>';
        });
    };
	
   var twitterat = function(t) {
        return t.replace(/(^|[^\w]+)\@([a-zA-Z0-9_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]{1,15}(\/[a-zA-Z0-9-_]+)*)/g, function(m, m1, m2) {
          return m1 + '<a href="http://twitter.com/' + m2 + '" target="_blank">@' + m2 + '</a>';
        });
    };
    
   var twitterhash = function(t) {
        return t.replace(/(^|[^&\w'"]+)\#([a-zA-Z0-9_^"^<àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/g, function(m, m1, m2) {
          return m.substr(-1) === '"' || m.substr(-1) == '<' ? m : m1 + '<a href="https://twitter.com/search?q=%23' + m2 + '&src=hash" target="_blank">#' + m2 + '</a>';
        });
    };
	 
    window.formatTwitter = function() {
		
		var t = $(this),
			text = t.text();
		if(t.attr('data-formattwitter') !== 'applyed') {
		
			text = twitterlink(text);
			text = twitterat(text);
			text = twitterhash(text);
			
			t.html(text);
		
			t.attr('data-formattwitter','applyed');
		}
    };
	
	/*if($('html').attr('lang') == 'fr') {
		jQuery.timeago.settings.strings = {
			// environ ~= about, it's optional
			prefixAgo: "il y a",
			prefixFromNow: "d'ici",
			seconds: "moins d'une minute",
			minute: "environ une minute",
			minutes: "environ %d minutes",
			hour: "environ une heure",
			hours: "environ %d heures",
			day: "environ un jour",
			days: "environ %d jours",
			month: "environ un mois",
			months: "environ %d mois",
			year: "un an",
			years: "%d ans"
		};
	}*/
	
})(jQuery);


(function ($) {
	"use strict";
	
	// ga facilitator
	$.sendPageView = function (opts) {
		if (!!window.ga) {
			var defaults = {
				page: window.location.pathname + window.location.search,
				location: window.location.href,
				hostname: window.location.hostname
			};
			var args = !opts ? defaults : $.extend(defaults, opts);
			
			window.ga('send', 'pageview', args);
		}
	};
})(jQuery);
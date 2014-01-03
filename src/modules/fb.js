/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Facebook async parsing
 */
(function ($, undefined) {
	'use strict';
	
	var facebookParse = function () {
		if (!!window.FB && !!window.FB.XFBML) {
			window.FB.XFBML.parse();
		}
	};
	
	var actions = function () {
		return {
			page: {
				entering: facebookParse
			},
			FB: {
				parse: facebookParse
			}
		};
	};
	
	var init = function () {
		facebookParse();
	};
	
	var FBParser = App.modules.exports('FB', {
		init: init,
		actions : actions
	});
	
})(jQuery);
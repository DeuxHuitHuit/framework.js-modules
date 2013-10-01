/**
 * @author Deux Huit Huit
 *
 * Default page implementation
 *
 */
(function ($, undefined) {

	"use strict";
	
	var onEnter = function(next) {
		App.callback(next);
	};
	
	var init = function() {
		
	};
	
	App.pages.exports("defaultPage", {
		init: init,
		enter : onEnter
	});
	
})(jQuery);

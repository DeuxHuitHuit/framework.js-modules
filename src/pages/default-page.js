/**
 * @author Deux Huit Huit
 *
 * Default page implementation
 *
 */

(function ($, global, undefined) {

	'use strict';
	
	App.pages.exports('defaultPage', function () {
		
		var onEnter = function (next) {
			App.callback(next);
		};
		
		var init = function () {
			
		};
		
		var self = {
			init: init,
			enter : onEnter
		};
		
		return self;
	});
	
})(jQuery, window);

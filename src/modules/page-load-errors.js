/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Page load error handling
 */
(function ($, undefined) {

	'use strict';
	
	var actions = function () {
		return {
			pages: {
				failedtoparse: function (key, data) {
					
				},
				loaderror: function (key, data) {
					
				},
				loadfatalerror: function (key, data) {
					
				}
			}
		};
	};
	
	var PageLoadErrors = App.modules.exports('page-load-errors', {
		actions: actions
	});
	
})(jQuery);

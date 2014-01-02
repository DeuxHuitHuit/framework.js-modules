/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Page loading handling
 */
(function ($, undefined) {

	'use strict';

	var actions = function () {
		return {
			pages: {
				loading: null,
				loadfatalerror: null,
				loadprogress: null,
				loaded: null,
				notfound: null
			}
		};
	};
	
	var init = function () {
		
	};
	
	var FBParser = App.modules.exports('page-load', {
		init: init,
		actions : actions
	});
	
})(jQuery);
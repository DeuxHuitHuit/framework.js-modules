/**
 *  @author Deux Huit Huit
 *
 */
(function ($, undefined) {

	'use strict';
	
	var resetTab = function () {
		$('.js-tab-reset').focus();
	};
	
	var actions = function () {
		return {
			page: {
				enter: resetTab
			}
		};
	};

	App.modules.exports('tab-navigation', {
		actions: actions
	});
	
})(jQuery);

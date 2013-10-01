/**
 * @author Deux Huit Huit
 * 
 * Toggle when no previous url are present
 *
 */
(function ($, undefined) {
	
	"use strict";
	
	var onToggleNoPreviousUrl = function() {
		App.mediator.goto('/');
	};
	
	var actions = function () {
		return {
			page : {
				toggleNoPreviousUrl : onToggleNoPreviousUrl
			}
		};
	},
	
	init = function () {
		
	},
	
	Links = App.modules.exports('toggleNoPreviousUrl', {
		init: init,
		actions: actions
	});
	
})(jQuery);

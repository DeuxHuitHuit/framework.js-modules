/**
 * @author Deux Huit Huit
 * 
 * auto jit image
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var firstTime = true;
	
	var onEnter = function (key, data) {
		if (!firstTime) {
			$(data.page.key()).find('img[data-src-format]').jitImage();
		}
		firstTime = false;
	};
	
	var actions = function () {
		return {
			page: {
				enter: onEnter
			}
		};
	};
	
	var AutoJitImage = App.modules.exports('auto-jit-image', {
		actions: actions
	});
	
})(jQuery, window);
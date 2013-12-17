/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	
	var resizeHandler = function (e) {
		App.mediator.notify('site.resize', null, e);
	};
	
	var scrollHandler = function (e) {
		App.mediator.notify('site.scroll', null, e);
	};
	
	var init = function () {
		//Trigger resize
		win.resize(resizeHandler).scroll(scrollHandler);
	};
	
	var WindowNotifier = App.modules.exports('windowNotifier', {
		init: init
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var doc = $(document);
	
	var notify = function (key, e) {
		App.mediator.notify('site.' + key, {event: e});
	};
	
	var resizeHandler = function (e) {
		notify('resize', e);
	};
	
	var scrollHandler = function (e) {
		notify('scroll', e);
	};
	
	var loadHandler = function (e) {
		notify('loaded', e);
	};
	
	var visibilityHandler = function (e) {
		var state = document.visibilityState || document.webkitVisibilityState || 'visible';
		notify('visibilitychange', e, state);
	};
	
	var init = function () {
		win
			.load(loadHandler)
			.scroll(scrollHandler);
		if (!$.mobile) {
			win.resize(resizeHandler);
		}
		doc
			.on('visibilitychange webkitvisibilitychange', visibilityHandler);
	};
	
	var WindowNotifier = App.modules.exports('windowNotifier', {
		init: init
	});
	
})(jQuery);

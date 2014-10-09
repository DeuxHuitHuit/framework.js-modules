/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	
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
	
	var init = function () {
		win
			.load(loadHandler)
			.resize(resizeHandler)
			.scroll(scrollHandler);
	};
	
	var WindowNotifier = App.modules.exports('windowNotifier', {
		init: init
	});
	
})(jQuery);

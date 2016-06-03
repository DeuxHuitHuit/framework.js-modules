/**
 * @author Deux Huit Huit
 *
 * Tracked Default page implementation
 *
 */

(function ($, global, undefined) {

	'use strict';
	
	App.pages.exports('trackedDefaultPage', function () {
		var page;
		var tracker = App.components.create('checkpoint-event', {
			category: 'Lecture',
			checkPoints: [25, 50, 75, 90, 100]
		});
		var win = $(window);
		var winH = win.height();
		var body = $('body');
		var bodyH = body.height();
		var scrollH = bodyH - winH;
		
		var onEnter = function (next) {
			onResize();
			App.callback(next);
		};
		
		var onLeave = function (next, data) {
			tracker.reset();
			App.callback(next);
		};
		
		var onResize = function () {
			winH = win.height();
			bodyH = body.height();
			scrollH = bodyH - winH;
		};
		
		var onScroll = function () {
			if (scrollH > 0) {
				tracker.track(win.scrollTop() / scrollH * 100);
			}
		}
		
		var init = function () {
			page = $(this.key());
			tracker.init();
		};
		
		var actions = function () {
			return {
				site: {
					scroll: onScroll,
					resize: onResize
				}
			};
		};
		
		var self = {
			init: init,
			enter: onEnter,
			leave: onLeave,
			actions: actions
		};
		
		return self;
	});
	
})(jQuery, window);

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
		var tracker = App.components.create('tracked-scroll');
		
		var onEnter = function (next) {
			App.callback(next);
		};
		
		var onLeave = function (next, data) {
			tracker.reset();
			App.callback(next);
		};
		
		var init = function () {
			page = $(this.key());
			tracker.init();
		};
		
		var actions = function () {
			return {
				site: {
					scroll: tracker.scroll
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

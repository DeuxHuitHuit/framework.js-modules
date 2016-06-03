/**
 * @author Deux Huit Huit
 */

(function ($, win, undefined) {

	'use strict';

	var defaults = {
		checkPoints: [0, 25, 50, 75, 90, 100],
		category: 'Scroll',
		action: 'scroll'
	};
	var body = $('body');

	App.components.exports('checkpoint-event', function (options) {
		var o = $.extend({}, defaults, options);
		var gate = 0;

		var track = function (perc) {
			if ($.isNumeric(o.checkPoints[gate]) &&
				$.isNumeric(perc) && o.checkPoints[gate] <= perc) {
				var action = o.action + ' ' + o.checkPoints[gate] + '%';
				var label = o.label || action;
				$.sendEvent(o.category, action, label, o.checkPoints[gate]);
				gate++;
			}
		};
		
		var reset = function () {
			gate = 0;
		};
		
		var init = function () {
			reset();
		};
		
		return {
			init: init,
			track: track,
			reset: reset
		};
	});

})(jQuery, jQuery(window));

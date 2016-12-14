/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);

	var onAttach = function (key, data) {

		if (data && data.item) {
			var notifyEnd = data.item.attr('data-transitionEnd-notify');
			if (notifyEnd && notifyEnd.length) {

				data.item.transitionEnd(function () {
					App.mediator.notify(notifyEnd, {item: data.item});
				})
			}
			
		}
	}
	
	var actions = function () {
		return {
			transitionEndNotify: {
				attach: onAttach
			}
		};
	};
	
	App.modules.exports('transitionEnd-notify', {
		actions: actions
	});
	
})(jQuery);

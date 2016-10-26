/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var BUTTON_SELECTOR = '.js-change-state-click';
	var BUTTON_TARGET_ATTR = 'data-change-state-click-target';
	var BUTTON_STATE_ATTR = 'data-change-state-click';
	var BUTTON_ACTION_ATTR = 'data-change-state-action';
	
	var findTargetItemIfAvailable = function (item, target) {
		//Find target if present
		if (target) {
			return site.find(target);
		} else {
			return item;
		}
	};

	var buttonClicked = function (e) {
		var t = $(this);

		var target = t.attr(BUTTON_TARGET_ATTR);
		var state = t.attr(BUTTON_STATE_ATTR);
		var action = t.attr(BUTTON_ACTION_ATTR);

		var item = t;

		//Valid needed info
		if (state && action) {

			item = findTargetItemIfAvailable(item, target);

			//Process item algo
			App.modules.notify('changeState.update', {
				item: item,
				state: state,
				action: action
			});
		}

		return window.pd(e);
	};

	var init = function () {
		//Attach click handler
		site.on($.click, BUTTON_SELECTOR, buttonClicked);
	};
	
	App.modules.exports('auto-change-state-click', {
		init: init
	});
	
})(jQuery);

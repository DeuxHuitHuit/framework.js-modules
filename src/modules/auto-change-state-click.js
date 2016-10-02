/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var BUTTON_SELECTOR = '.js-change-state-click-button';

	var setItemState = function (item, state, flag) {
		//Flag class
		var flagClass = item.attr('data-' + state + '-state-flag-class');

		if (flag) {
			//Set state
			item.addClass(item.attr('data-' + state + '-state-add-class'));
			item.removeClass(item.attr('data-' + state + '-state-rem-class'));
			item.addClass(flagClass);
		} else {
			//Remove state
			item.removeClass(item.attr('data-' + state + '-state-add-class'));
			item.addClass(item.attr('data-' + state + '-state-rem-class'));
			item.removeClass(flagClass);
		}
	};

	var processItem = function (item, state, action) {
		var flagClass = item.attr('data-' + state + '-state-flag-class');
		var curBoolState = item.hasClass(flagClass);

		if (action == 'toggle') {
			setItemState(item, state, !curBoolState);
		} else if (action == 'on' && !curBoolState) {
			setItemState(item, state, true);
		} else if (action == 'off' && curBoolState) {
			setItemState(item, state, false);
		} else {
			App.log('Action: ' + action + ' is not recognized: Actions available are : toggle,on,off');
		}
	};

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

		var target = t.attr('data-change-state-click-target');
		var state = t.attr('data-change-state-click');
		var action = t.attr('data-change-state-action');
		var item = t;

		//Valid needed info
		if (state && action) {

			item = findTargetItemIfAvailable(item, target);
			//Process item algo
			processItem(item, state, action)
		}

		return window.pd(e);
	};

	var onUpdateState = function (key, data) {
		if (data && data.item && data.state && data.action) {
			processItem(data.item, data.state, data.action)
		}
	};
	
	var init = function () {
		//Attach click handler
		site.on('click', BUTTON_SELECTOR, buttonClicked);
	};
	
	var actions = function () {
		return {
			changeState: {
				update: onUpdateState
			}
		};
	};
	
	App.modules.exports('auto-change-state-click', {
		init: init,
		actions: actions
	});
	
})(jQuery);

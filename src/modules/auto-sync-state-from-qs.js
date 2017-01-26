/**
 *  @author Deux Huit Huit
 *
 *  Auto sync state from qs
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var ITEM_SELECTOR = '.js-auto-sync-state-from-qs';

	var setItemState = function (item, state, flag) {

		if (flag) {
			//Set state
			item.addClass(item.attr('data-' + state + '-state-add-class'));
			item.removeClass(item.attr('data-' + state + '-state-rem-class'));
		} else {
			//Remove state
			item.removeClass(item.attr('data-' + state + '-state-add-class'));
			item.addClass(item.attr('data-' + state + '-state-rem-class'));
		}
	};

	var processItemState = function (item, state, conditions) {

		var isOn = false;
		var qs = App.routing.querystring.parse(document.location.search);

		$.each(conditions.split(','), function (i, e) {
			var splitedCondition = e.split('=');
			var key = splitedCondition[0];
			var value = splitedCondition[1];
			if (value.length) {
				if (qs[key] && qs[key] == value) {
					isOn = true;
				}
			} else if (qs[key] && qs[key].length === 0 || !!!qs[key]) {
				//Set state on when empty
				isOn = true;
			}
		});

		setItemState(item, state, isOn);
	};

	var syncState = function () {
		site.find(ITEM_SELECTOR).each(function () {
			var t = $(this);
			var states = t.attr('data-sync-state-from-qs');
			if (states.length) {
				var statesList = states.split(';');
				$.each(statesList, function (i, e) {
					var splitedStateValue = e.split(':');
					var state = splitedStateValue[0];
					var conditions = splitedStateValue[1];

					processItemState(t, state, conditions);
				});
			}
		});
	};

	var onFragmentChanged = function () {
		syncState();
	};
	
	var init = function () {
		syncState();
	};
	
	var actions = function () {
		return {
			page: {
				fragmentChanged: onFragmentChanged
			}
		};
	};
	
	App.modules.exports('auto-sync-state-from-qs', {
		init: init,
		actions: actions
	});
	
})(jQuery);

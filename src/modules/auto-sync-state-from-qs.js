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
	var ATTR_STATES = 'data-sync-state-from-qs';
	var ATTR_VALUE_LIST = 'data-sync-state-from-qs-value-list';

	var setItemState = function (item, state, flag) {
		App.fx.notify('changeState.update', {
			item: item,
			state: state,
			action: flag ? 'on' : 'off'
		});
	};

	var processItemState = function (item, state, conditions, useList) {
		var isOn = false;
		var qs = App.routing.querystring.parse(window.location.search);

		$.each(conditions.split(','), function (i, e) {
			var splitedCondition = e.split('=');
			var key = splitedCondition[0];
			var value = splitedCondition[1];

			// Did not found a key, continue to next condition
			if (!key) {
				return true;
			}

			// Values are equal or both falsy ('' vs null vs undefined)
			if (qs[key] === value || (!qs[key] && !value)) {
				isOn = true;
			// Use list, only if we have values
			} else if (!!useList && !!qs[key] && !!value) {
				var splittedQs = qs[key].split(',');
				isOn = !!~splittedQs.indexOf(value);
			}
			return !isOn;
		});

		setItemState(item, state, isOn);
	};

	var syncState = function () {
		site.find(ITEM_SELECTOR).each(function () {
			var t = $(this);
			var states = t.attr(ATTR_STATES);
			var useValueList = t.attr(ATTR_VALUE_LIST);

			if (!!states.length) {
				var statesList = states.split(';');

				$.each(statesList, function (i, e) {
					var splitedStateValue = e.split(':');
					var state = splitedStateValue[0];
					var conditions = splitedStateValue[1];

					processItemState(t, state, conditions, useValueList);
				});
			}
		});
	};

	var onFragmentChanged = function () {
		syncState();
	};
	
	var onArticleChangerEnter = function () {
		syncState();
	};

	var init = function () {
		syncState();
	};
	
	var actions = function () {
		return {
			page: {
				fragmentChanged: onFragmentChanged
			},
			articleChanger: {
				enter: onArticleChangerEnter
			}
		};
	};
	
	App.modules.exports('auto-sync-state-from-qs', {
		init: init,
		actions: actions
	});
	
})(jQuery);

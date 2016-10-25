/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);

	var setItemState = function (item, state, flag) {
		//Flag class
		var flagClass = item.attr('data-' + state + '-state-flag-class');

		var addClass = item.attr('data-' + state + '-state-add-class');
		var remClass = item.attr('data-' + state + '-state-rem-class');


		if (item[0].nodeName == 'polygon' || 
			item[0].nodeName == 'polyline' || 
			item[0].nodeName == 'path' || 
			item[0].nodeName == 'g') {
			if (flag) {
				item[0].classList.add(addClass);
				item[0].classList.remove(remClass);
				item[0].classList.add(flagClass);
			} else {
				item[0].classList.remove(addClass);
				item[0].classList.add(remClass);
				item[0].classList.remove(flagClass);
			}
		} else {
	
			if (flag) {
				//Set state
				item.addClass(addClass);
				item.removeClass(remClass);
				item.addClass(flagClass);
			} else {
				//Remove state
				item.removeClass(addClass);
				item.addClass(remClass);
				item.removeClass(flagClass);
			}
		}
	};

	var processItem = function (item, state, action) {
		var flagClass = item.attr('data-' + state + '-state-flag-class');
		var curBoolState = item.hasClass(flagClass);

		if (item[0].nodeName == 'polygon' || 
			item[0].nodeName == 'polyline' || 
			item[0].nodeName == 'path'  || 
			item[0].nodeName == 'g') {
			curBoolState = item[0].classList.contains(flagClass);
		}
		

		if (action == 'toggle') {
			setItemState(item, state, !curBoolState);
		} else if (action == 'on') {
			if (!curBoolState) {
				setItemState(item, state, true);
			}
		} else if (action == 'off') {
			if (curBoolState) {
				setItemState(item, state, false);
			}
		} else {
			App.log('Action: ' + action + ' is not recognized: Actions available are : toggle,on,off');
		}
	};

	var onUpdateState = function (key, data) {
		if (data && data.item && data.state && data.action) {
			processItem(data.item, data.state, data.action)
		}
	};
	
	var init = function () {

	};
	
	var actions = function () {
		return {
			changeState: {
				update: onUpdateState
			}
		};
	};
	
	App.modules.exports('change-state', {
		init: init,
		actions: actions
	});
	
})(jQuery);

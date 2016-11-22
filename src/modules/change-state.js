/**
 * @author Deux Huit Huit
 *
 *	ATTRIBUTES :
 *		(MINIMAL)
 *		- data-{state}-state-flag-class
 *		(OPTIONAL)
 *		- data-{state}-state-add-class
 *		- data-{state}-state-rem-class
 *
 *		- data-{state}-state-follower (Not functionnal)
 *
 *
 *	NOTIFY IN :
 *		- changeState.update
 *			{item,state,flag}
 *
 *
 *	NOTIFY OUT :
 *		- changeState.begin
 *			{item,state,flag}
 *		- changeState.end
 *			{item,state,flag}
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);

	var isSvgElement = function (item) {
		return !!item && !!item.length &&
			item[0].nodeName == 'polygon' ||
			item[0].nodeName == 'polyline' ||
			item[0].nodeName == 'path' ||
			item[0].nodeName == 'g';
	};

	var setItemState = function (item, state, flag) {
		//Flag class
		var flagClass = item.attr('data-' + state + '-state-flag-class');
		var addClass = item.attr('data-' + state + '-state-add-class');
		var remClass = item.attr('data-' + state + '-state-rem-class');

		var followerSelector = item.attr('data-' + state + '-state-follower');

		App.modules.notify('changeState.begin', {item: item, state: state, flag: flag});

		var ieBehavior = function () {
			//IE BEHAVIOR
			var newClass = [];
			var curClass = item.attr('class').split(' ');
			var finalClass = '';

			if (flag) {

				var remClassArray = [];
				if (remClass) {
					remClassArray = remClass.split(' ');
				}

				//Add New class
				if (addClass) {
					newClass.push(addClass.split(' '));
				}
				
				//Add Flag class
				newClass.push(flagClass);

				//Remove class
				$.each(curClass, function (i, e) {

					if (remClassArray.indexOf(e) == -1) {
						newClass.push(e);
					}
				});
				
				$.each(newClass, function (i, e) {
					finalClass += ' ' + e;
				});

				//Set class attribute
				item.attr('class', finalClass);
			} else {

				//Remove Add class and flag class
				var addClassArray = [];
				if (addClass) {
					addClassArray = addClass.split(' ');
				}

				$.each(curClass, function (i, e) {
					if (e != flagClass) {
						if (addClassArray.indexOf(e) == -1) {
							newClass.push(e);
						}
					}
				});
				

				//Add Remove Class
				if (remClass) {
					newClass.push(remClass.split(' '));
				}

				$.each(newClass, function (i, e) {
					finalClass += ' ' + e;
				});

				item.attr('class', finalClass);
			}
		};

		var setSvgItemState = function () {
			if (item[0].classList) {
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
				ieBehavior();
			}
		};

		if (isSvgElement(item)) {
			setSvgItemState();
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
		
		App.modules.notify('changeState.end', {item: item, state: state, flag: flag});
	};

	var processItem = function (item, state, action) {
		var flagClass = item.attr('data-' + state + '-state-flag-class');
		var curBoolState = item.hasClass(flagClass);

		if (isSvgElement(item)) {
			if (item[0].classList) {
				curBoolState = item[0].classList.contains(flagClass);
			} else {
				//Ie Behavior
				var classList = item.attr('class').split(' ');
				curBoolState = classList.indexOf(flagClass) != -1;
			}
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
			App.log('Action: ' + action +
				' is not recognized: Actions available are : toggle, on or off');
		}
	};

	var onUpdateState = function (key, data) {
		if (data && data.item && data.state && data.action) {
			processItem(data.item, data.state, data.action);
		}
	};
	
	var actions = function () {
		return {
			changeState: {
				update: onUpdateState
			}
		};
	};
	
	App.modules.exports('change-state', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  popup
 */
(function ($, undefined) {
	
	'use strict';
	
	var ANIM_STATE = 'popup-poped';
	var POPUP_SELECTOR = '.js-popup';
	var BG_SELECTOR = '.js-popup-bg';
	var RESET_ON_CLOSE_ATTR = 'data-popup-reset-on-close';
	
	var toggleAnimInited = function (action, popup) {
		popup.addClass('noanim');
		App.modules.notify('changeState.update', {
			item: popup,
			action: action,
			state: ANIM_STATE
		});
		popup.height();
		popup.removeClass('noanim');
	};
	
	var toggleAnim = function (action, popup) {
		App.modules.notify('changeState.update', {
			item: popup,
			action: action,
			state: ANIM_STATE
		});
	};
	
	var openPopup = function (key, data) {
		var popup = $(data.popup);
		var bg = popup.find(BG_SELECTOR);
		var isAlreadyPopep = popup.hasClass('is-' + ANIM_STATE);
		
		// prepare anim
		toggleAnimInited('off', popup);
		// callback to do things just before animating the popup
		App.callback(data.openCallback);
		
		if (!isAlreadyPopep) {
			$.removeFromTransition(bg.selector);
			bg.transitionEnd(function () {
				// callback to do things just after animating the popup
				App.callback(data.openedCallback,[{
					popup: popup
				}]);
			});
			// do the anim
			toggleAnim('on', popup);
		}
	};
	
	var closePopup = function (key, data) {
		var popup = $(data.popup);
		var bg = popup.find(BG_SELECTOR);
		var isAlreadyPopep = popup.hasClass('is-' + ANIM_STATE);
		
		if (isAlreadyPopep) {
			// return to riginal state once anim is done
			$.removeFromTransition(bg.selector);
			bg.transitionEnd(function () {
				
				//Reset on close if enabled
				if (popup.filter('[' + RESET_ON_CLOSE_ATTR + ']').length) {
					toggleAnimInited('on', popup);
				}
				
				// callback to do things just after animating the popup
				App.callback(data.closeCallback,[{
					popup: popup
				}]);
			});
			
			//do the anim
			toggleAnim('off', popup);
		}
	};
	
	var togglePopup = function (key, data) {
		var isAlreadyPopep = $(data.popup).hasClass('is-' + ANIM_STATE);
		
		if (isAlreadyPopep) {
			//popup is opened and we want to close
			closePopup('', data);
		} else {
			openPopup('', data);
		}
	};
	
	var actions = function () {
		return {
			popup: {
				open: openPopup,
				close: closePopup,
				toggle: togglePopup
			}
		};
	};
	
	App.modules.exports('popup', {
		actions: actions
	});
	
})(jQuery);

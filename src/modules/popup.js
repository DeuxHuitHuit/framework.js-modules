/**
 *  @author Deux Huit Huit
 *
 *  popup
 */
(function ($, undefined) {
	
	'use strict';
	
	var ANIM_STATE = 'popup-poped';
	var ANIM_INITED_STATE = 'popup-inited';
	var BG_SELECTOR = '.js-popup-bg';
	var CONTENT_SELECTOR = '.js-popup-content';
	var TRANSITION_END_SELECTOR_ATTR = 'data-popup-transition-end-selector';
	var RESET_ON_CLOSE_ATTR = 'data-popup-reset-on-close';
	
	var toggleAnimInited = function (action, popupBg, popupContent) {
		popupBg.addClass('noanim');
		App.modules.notify('changeState.update', {
			item: popupBg,
			action: action,
			state: ANIM_INITED_STATE
		});
		popupBg.height();
		popupBg.removeClass('noanim');
		
		popupContent.addClass('noanim');
		App.modules.notify('changeState.update', {
			item: popupContent,
			action: action,
			state: ANIM_INITED_STATE
		});
		popupContent.height();
		popupContent.removeClass('noanim');
	};
	
	var toggleAnim = function (action, popupBg, popupContent) {
		App.modules.notify('changeState.update', {
			item: popupBg,
			action: action,
			state: ANIM_STATE
		});
		
		App.modules.notify('changeState.update', {
			item: popupContent,
			action: action,
			state: ANIM_STATE
		});
	};
	
	var openPopup = function (key, data) {
		var popup = $(data.popup);
		var bg = popup.find(BG_SELECTOR);
		var content = popup.find(CONTENT_SELECTOR);
		
		// prepare anim
		toggleAnimInited('on', bg, content);
		// callback to do things just before animating the popup
		App.callback(data.openCallback);
		// do the anim
		toggleAnim('on', bg, content);
	};
	
	var closePopup = function (key, data) {
		var popup = $(data.popup);
		var bg = popup.find(BG_SELECTOR);
		var isAlreadyPopep = bg.hasClass('is-' + ANIM_STATE);
		
		if (isAlreadyPopep) {
			var content = popup.find(CONTENT_SELECTOR);
			
			// return to riginal state once anim is done
			bg.transitionEnd(function () {
				
				//Reset on close if enabled
				if (popup.filter('[' + RESET_ON_CLOSE_ATTR + ']').length) {
					toggleAnimInited('off', bg, content);
				}
				
				// callback to do things just after animating the popup
				App.callback(data.closeCallback);
			});
			
			//do the anim
			toggleAnim('off', bg, content);
		}
	};
	
	var togglePopup = function (key, data) {
		var isAlreadyPopep = $(data.popup).find(BG_SELECTOR).hasClass('is-' + ANIM_STATE);
		
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

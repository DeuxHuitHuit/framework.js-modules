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
	var FOCUSABLE = [
		'a[href]',
		'area[href]',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'button:not([disabled])',
		'iframe, object, embed',
		'[tabindex], [contenteditable]'
	].join(',');
	
	var focusable = function (popup) {
		return $(FOCUSABLE).filter(function () {
			var t = $(this);
			// element not in popup or is background
			return !t.closest(popup).length || t.is(BG_SELECTOR);
		});
	};
	
	var restoreFocusable = function (i, e) {
		var t = $(e);
		var tab = t.data('acc-tabindex');
		if (tab) {
			t.attr('tabindex', tab);
		} else {
			t.removeAttr('tabindex');
		}
	};
	
	var keyUp = function (e) {
		if (e.which === window.keys.escape) {
			$(this).find('.js-popup-close-btn').click();
		}
	};
	
	var removeFocusable = function (i, e) {
		var t = $(e);
		var tab = t.attr('tabindex');
		if (tab === '-1') {
			return;
		}
		t.data('acc-tabindex', tab || undefined);
		t.attr('tabindex', '-1');
	};
	
	var a11y = function (popup) {
		if (!popup || !popup.length) {
			return;
		}
		// Disable focus for accessibility
		focusable(popup).each(removeFocusable);
		// Re enable focus for accessibility
		popup.find(FOCUSABLE).each(restoreFocusable);
		popup.on('keyup', keyUp);
	};
	
	var a11yReset = function (popup) {
		if (!popup || !popup.length) {
			return;
		}
		// Re enable focus for accessibility
		focusable(popup).each(restoreFocusable);
		// Disable focus for accessibility
		popup.find(FOCUSABLE).each(restoreFocusable);
		popup.off('keyup', keyUp);
	};
	
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
				App.callback(data.openedCallback, [{
					popup: popup
				}]);
			});
			// do the anim
			toggleAnim('on', popup);
			a11y(popup);
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
				App.callback(data.closeCallback, [{
					popup: popup
				}]);
			});
			
			//do the anim
			toggleAnim('off', popup);
			a11yReset(popup);
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
	
	var init = function () {
		a11y($(POPUP_SELECTOR));
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
		actions: actions,
		init: init
	});
	
})(jQuery);

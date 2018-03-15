/**
 *  @author Deux Huit Huit
 *
 * Keyboard navigation:
 *  Provides a way to only show outline when the user is using the keyboard.
 *
 */
(function ($, undefined) {
	
	'use strict';
	var doc = $(document);
	var CLASS = 'keyboard-nav';
	var KD = 'keydown';
	var TI = 'tabindex';
	var root = $('html');
	
	var click = function (e) {
		root.removeClass(CLASS);
		doc.on(KD, keydown);
		App.mediator.notify('keyboardNav.disabled');
	};
	
	var keydown = function (e) {
		if (e.which === window.keys.tab) {
			root.addClass(CLASS);
			doc.off(KD, keydown).one('click', click);
			App.mediator.notify('keyboardNav.enabled');
		}
	};
	
	var init = function () {
		doc.on(KD, keydown);
	};
	
	var toggleTabIndex = function (key, data) {
		if (!data || !data.item) {
			return;
		}
		if (!data.item.is('.js-focusable')) {
			return;
		}
		if (data.trigger === 'after') {
			data.item.removeAttr(TI);
		} else {
			data.item.attr(TI, '-1');
		}
	};
	
	var actions = function () {
		return {
			autoToggleClassOnScroll: {
				executed: toggleTabIndex
			}
		};
	};
	
	App.modules.exports('keyboard-nav', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var BTN_SELECTOR = '.js-auto-modal-btn';
	var COMMON_ANCESTOR_SELECTOR_ATTR = 'data-auto-modal-common-ancestor';
	var POPUP_SELECTOR_ATTR = 'data-auto-modal-popup-selector';
	var INNER_SCROLL_ATTR = 'data-inner-scroll-selector';
	
	var toggleModalState = function (popup, isPopep) {
		var scrollFx = isPopep ? 'removeScroll' : 'addScroll';
		App.modules.notify('site.' + scrollFx);
	};

	var onButtonClick = function (e) {
		var t = $(this);
		var commonAncestor = t.closest(t.attr(COMMON_ANCESTOR_SELECTOR_ATTR));
		var reelRef = !!commonAncestor.length ? commonAncestor : site;
		var popup = reelRef.find(t.attr(POPUP_SELECTOR_ATTR));
		
		if (!!popup.length) {
			App.modules.notify('popup.toggle', {
				popup: popup,
				openCallback: function () {
					toggleModalState(popup, true);
				},
				closeCallback: function () {
					popup.find(popup.attr(INNER_SCROLL_ATTR)).scrollTop(0);
					toggleModalState(popup, false);
				}
			});
		} else {
			App.log('auto-modal: No popup found with selector : ' + t.attr(POPUP_SELECTOR_ATTR));
		}
		
		return window.pd(e);
	};

	var init = function () {
		site.on($.click, BTN_SELECTOR, onButtonClick);
	};
	
	App.modules.exports('auto-modal', {
		init: init
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var curPage = $();
	
	var BUTTON_SELECTOR = '.js-merge-qs-value-button';
	var KEY_ATTR = 'data-merge-qs-value-key';
	var VALUE_ATTR = 'data-merge-qs-value';
	
	var buttonClicked = function (e) {
		
		//Scroll To hash
		var t = $(this);
		var key = t.attr(KEY_ATTR);
		var value = t.attr(VALUE_ATTR);
		var qs = window.QueryStringParser.parse(document.location.search);
		
		// Minimal attribute needed for proceeding
		if (!!key) {
			//Build new qs
			if (!!value) {
				qs[key] = value;
			} else {
				qs[key] = null;
			}
			
			// Update Url and raise fragmentChanged
			App.mediator.notify('page.updateQsFragment', {
				qs: qs,
				raiseFragmentChanged: true
			});
			
			return window.pd(e, true);
		}
	};
	
	var init = function () {
		site.on($.click, BUTTON_SELECTOR, buttonClicked);
	};
	
	App.modules.exports('auto-merge-qs-value', {
		init: init
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';

	var BTN_SELECTOR = '.js-site-nav-link';
	var SELECTED_CLASS = 'is-selected';
	var ATTR_SELECTED_ADD = 'data-selected-class-add';
	var ATTR_SELECTED_REMOVE = 'data-selected-class-remove';
	var site = $('#site');
	
	var updateSelectedLink = function (newKey) {
		var newBtn = site.find(BTN_SELECTOR + '.btn-' + newKey);

		//Remove Selected state on all node
		site.find(BTN_SELECTOR + '.' + SELECTED_CLASS)
			.not(newBtn)
			.each(function () {

				//Remove is selected state
				var t = $(this);
				t.removeClass(SELECTED_CLASS)
					.removeClass(t.attr(ATTR_SELECTED_ADD))
					.addClass(t.attr(ATTR_SELECTED_REMOVE));
			});

		//Add class
		newBtn.each(function () {
			var t = $(this);

			t.addClass(SELECTED_CLASS)
				.addClass(t.attr(ATTR_SELECTED_ADD))
				.removeClass(t.attr(ATTR_SELECTED_REMOVE));
		});
	};
	
	var onEntering = function (key, data) {
		//check page
		var newPage = $(data.page.key());
		updateSelectedLink(data.page.key().substring(1));
	};
	
	var actions = function () {
		return {
			page: {
				entering: onEntering
			}
		};
	};
	
	App.modules.exports('site-nav-link-selector', {
		actions: actions
	});
	
})(jQuery);

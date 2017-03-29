/**
 *  @author Deux Huit Huit
 *
 *  Site nav link selector
 */
(function ($, undefined) {
	
	'use strict';

	var BTN_SELECTOR = '.js-site-nav-link';
	var SELECTED_CLASS = 'is-selected';
	var site = $('#site');
	
	var updateSelectedLink = function (newKey) {
		var newBtn = site.find(BTN_SELECTOR + '.btn-' + newKey);

		//Remove Selected state on all node
		site.find(BTN_SELECTOR + '.' + SELECTED_CLASS)
			.not(newBtn)
			.each(function () {

				//Remove is selected state
				var t = $(this);
				App.modules.notify('changeState.update', {
					item: t,
					state: 'selected',
					action: 'off'
				});
			});

		//Add class
		newBtn.each(function () {
			var t = $(this);

			App.modules.notify('changeState.update', {
				item: t,
				state: 'selected',
				action: 'on'
			});
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

/**
 * @author Deux Huit Huit
 *
 * BASIC DETAIL PAGE
 *
 */

(function ($, global, undefined) {

	'use strict';
	
	App.pages.exports('default-detail-page', function () {
		var page;
		var changer = App.components.create('articleChanger');
		var isFirstFragment = true;

		var onLeave = function (next, data) {
			if (!!data.canRemove) {
				page.remove();
			}

			App.callback(next);
		};

		var onFragmentChanged = function (key, data) {
			var frag = !!data ? data : '';

			changer.navigateTo(frag.split('/')[0]);
		};
		
		var init = function () {
			page = $(this.key());

			changer.init(page, {
				startPageHandle: page.find('.js-article').attr('data-handle')
			});
		};
		
		var actions = function () {
			return {
				page: {
					fragmentChanged: onFragmentChanged
				}
			};
		};
		
		var self = {
			init: init,
			leave: onLeave,
			actions: actions
		};
		
		return self;
	});
	
})(jQuery, window);

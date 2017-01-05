/**
 * @author Deux Huit Huit
 *
 * auto jit image
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var firstTime = true;
	var site = $('#site');
	var page = $('.page');
	
	var update = function (ctn) {
		ctn.find('a[data-mailto]').each(function () {
			var t = $(this);
			t.attr('href', 'mailto:' + t.attr('data-mailto'));
		});
	};

	var onArticleEnter = function (key, data) {
		update(data.article);
	};

	var onEnter = function (key, data) {
		page = $(data.page.key());
		update(page);
	};

	var init = function () {
		update(site);
	};
	
	var actions = function () {
		return {
			page: {
				enter: onEnter
			},
			articleChanger: {
				enter: onArticleEnter
			}
		};
	};
	
	var AutoJitImage = App.modules.exports('auto-mailto', {
		init: init,
		actions: actions
	});
	
})(jQuery, window);

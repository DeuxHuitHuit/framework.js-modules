/**
 * @author Deux Huit Huit
 *
 * Auto native share form
 * Uses https://github.com/WICG/web-share
 */
(function ($, global, undefined) {

	'use strict';

	var site = $('#site');
	var sels = {
		item: '.js-native-share'
	};
	var SUPPORTED = !!window.navigator.share;
	var scope = $();

	var onClick = function (e) {
		window.navigator.share({
			title: document.title,
			url: document.location.href || ('' + document.location)
		});
		return global.pd(e);
	};

	var init = function () {
		if (SUPPORTED) {
			site.on(App.device.events.click, sels.item, onClick);
		}
	};

	var removeAll = !SUPPORTED && function () {
		scope.find(sels.item).remove();
	};

	var onPageEnter = !SUPPORTED && function (key, data) {
		scope = $(data.page.key());
		removeAll();
	};

	var onArticleEnter = !SUPPORTED && function (key, data) {
		scope = $(data.article);
		removeAll();
	};

	var actions = SUPPORTED ? undefined : function () {
		return {
			page: {
				enter: onPageEnter
			},
			articleChanger: {
				enter: onArticleEnter
			}
		};
	};

	App.modules.exports('auto-native-share', {
		init: init,
		actions: actions
	});

})(jQuery, window);

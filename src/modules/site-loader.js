/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {

	'use strict';

	var win = $(window);
	var SELECTOR = '.js-site-loader';

	var siteLoaderPanel = $(SELECTOR);

	var destroyLoader = function () {
		siteLoaderPanel.remove();
		App.modules.notify('siteLoader.finished');
	};

	var closeLoader = function () {
		App.modules.notify('siteLoader.closing');
		if (!!siteLoaderPanel.length) {

			$('.js-site-loader-close-ended-anim-ref').transitionEnd(destroyLoader);

			App.modules.notify('changeState.update', {
				item: siteLoaderPanel,
				state: 'close',
				action: 'on'
			});
		}
	};

	var pageLoaded = function () {
		App.modules.notify('siteLoader.pageLoaded');
		if (!!siteLoaderPanel.length) {
			setTimeout(closeLoader, 1000);
		}
	};

	/*********************** INIT */
	var init = function () {
		App.modules.notify('siteLoader.initing');
		if (App.debug()) {
			destroyLoader();
		} else {
			setTimeout(closeLoader, 9500);
		}
	};
	
	var actions = function () {
		return {
			site: {
				loaded: pageLoaded
			}
		};
	};

	App.modules.exports('site-loader', {
		init: init,
		actions: actions
	});

})(jQuery);

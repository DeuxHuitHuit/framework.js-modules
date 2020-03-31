/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';

	var win = $(window);
	var isPopState = false;
	var popData = null;

	var onPopState = function (key, data) {
		popData = data;
		isPopState = true;
	};

	var updateScroll = function (key, data) {
		if (!!data.state && !!data.state.scrollPos) {
			win.scrollTop(data.state.scrollPos);
			App.mediator.notify('site.scroll');
			App.mediator.notify('site.postscroll');
		}
	};

	var onPageEnter = function () {
		if (isPopState) {
			isPopState = false;
			updateScroll(null, popData);
		}
	};

	var init = function () {
		if (!!window.history.scrollRestoration) {
			window.history.scrollRestoration = 'manual';
		}
	};

	var actions = function () {
		return {
			history: {
				popState: onPopState
			},
			page: {
				enter: onPageEnter
			},
			articleChanger: {
				enter: onPageEnter
			}
		};
	};
	
	App.modules.exports('siteScrollKeeper', {
		init: init,
		actions: actions
	});
	
})(jQuery);

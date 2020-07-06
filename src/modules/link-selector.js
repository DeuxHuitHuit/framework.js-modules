/**
 * Link selector
 * @author Deux Huit Huit
 */
(function ($, undefined) {

	'use strict';

	var isMultilingual = ($('html').attr('data-all-langs') || '').split(',').length > 1 || true;
	var scope = $('body');
	var fakeAnchor = $('<a />');

	var MINIMUM_FOR_PARTIAL = 2;

	var update = function () {
		var currentPath = window.location.pathname;
		var links = scope.find('a[href]');

		links.each(function () {
			var t = $(this);

			App.fx.notify('changeState.update', {
				item: t,
				state: 'current-link-partial',
				action: 'off'
			});
	
			App.fx.notify('changeState.update', {
				item: t,
				state: 'current-link',
				action: 'off'
			});
		});

		links.each(function () {
			var t = $(this);
			var pathname = '';
			var matches = [];

			fakeAnchor.prop('href', t.attr('href'));
			pathname = fakeAnchor.prop('pathname');

			// IE respects the spec, for once...
			if (pathname.charAt(0) !== '/') {
				pathname = '/' + pathname;
			}

			$.each(pathname.split('/'), function (index, element) {
				if (!!element && element === currentPath.split('/')[index]) {
					matches.push(element);
				}
			});

			if (!!isMultilingual && matches.length < MINIMUM_FOR_PARTIAL) {
				matches = [];
			}

			// Partial match
			App.fx.notify('changeState.update', {
				item: t,
				state: 'current-link-partial',
				action: (!!matches.length && pathname !== currentPath) ? 'on' : 'off'
			});

			// Exact match
			App.fx.notify('changeState.update', {
				item: t,
				state: 'current-link',
				action: pathname === currentPath ? 'on' : 'off'
			});
		});
	};

	var onPageEnter = function (key, data) {
		update();
	};

	var onArticleEnter = function (key, data) {
		update();
	};

	var init = function () {
		update();
	};

	var actions = function () {
		return {
			page: {
				enter: onPageEnter
			},
			articleChanger: {
				enter: onArticleEnter
			}
		};
	};

	App.modules.exports('link-selector', {
		init: init,
		actions: actions
	});

})(jQuery);

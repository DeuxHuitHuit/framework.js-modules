/**
 * @author Deux Huit Huit
 * 
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var ITEM_SELECTOR = '.js-auto-sync-property';
	var PROPERTY_ATTR = 'data-sync-property';
	var SOURCE_ATTR = 'data-sync-property-from';
	var COMMON_ANCESTOR_ATTR = 'data-sync-property-from-common-ancestor';
	
	var processItem = function (t) {
		var property = t.attr(PROPERTY_ATTR);

		if (property) {
			var sourceSelector = t.attr(SOURCE_ATTR);
			var commonAncestorSelector = t.attr(COMMON_ANCESTOR_ATTR);
			var scope = site;
			var source = null;

			if (commonAncestorSelector) {
				scope = t.closest(commonAncestorSelector);
			}

			if (scope.length) {
				source = scope.find(sourceSelector);
			}

			if (source.length) {
				if (property == 'height') {
					//Ensure to get not rounded value from jquery
					var value = Math.floor(parseFloat(window.getComputedStyle(source[0]).height));
					t.css({height: value});
				}
			}
		}
	};

	var processAllItems = function () {
		site.find(ITEM_SELECTOR).each(function (i, e) {
			var t = $(this);
			processItem(t);
		});
	};

	var onResize = function () {
		processAllItems();
	};

	var onPageEnter = function () {
		processAllItems();
		setTimeout(processAllItems, 50);
	};
	
	var init = function () {
		processAllItems();
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: onPageEnter
			}
		};
	};
	
	App.modules.exports('auto-sync-property', {
		init: init,
		actions: actions
	});
	
})(jQuery);

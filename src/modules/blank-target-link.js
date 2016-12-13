/**
 * @author Deux Huit Huit
 *
 * Blank link targets
 *
 * Listens to
 *
 * -
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	/**
	 * @author Deux Huit Huit
	 *
	 * Link target : Add target blank to all outside link
	 */
	$.fn.extend({
		blankLink: function () {
			/* link target */
			$(this).each(function eachTarget () {
				var t = $(this);
				var href = t.attr('href');
				
				if (!!href && (/^https?:\/\//.test(href) || /^\/workspace/.test(href))) {
					if (!t.attr('target')) {
						t.attr('target', '_blank');
					}
				}
			});
		}
	});
	
	var page = $('.page');
	
	var update = function (ctn) {
		ctn.find('a').blankLink();
	};
	
	var onPageEnter = function (key, data, e) {
		page = $(data.page.key());
		
		update(page);
	};
	
	var onArticleEnter = function (key, data) {
		update(data.article);
	};
	
	var init = function () {
		$('a').blankLink();
	};
	
	var actions = {
		page: {
			enter: onPageEnter
		}
	};
	
	var BlankLinkModule = App.modules.exports('blankLinkModule', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);

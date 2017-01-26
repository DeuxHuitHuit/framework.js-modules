/**
 *  @author Deux Huit Huit
 *
 *  Site scroll
 *      Site scrollBar add-remove with scrollbar size fix algo
 *      (pad, right, margin)
 *
 *  Use .js-fix-scroll
 *      -pad : Add/remove padding-right scrollbar size fix
 *      -right : Add/remove right scrollbar size fix
 *      -margin : Add/remove margin-right scrollbar size fix
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	var html = $('html');
	
	var fixScroll = function (value) {
		$('.js-fix-scroll-pad').css({paddingRight: value || ''});
		$('.js-fix-scroll-right').css({right: value || ''});
		$('.js-fix-scroll-margin').css({marginRight: value || ''});
	};
	
	var addScroll = function () {
		html.removeClass('no-scroll');
		fixScroll(0);
	};
	
	var removeScroll = function () {
		if (!html.hasClass('no-scroll')) {
			var x = win.width();
			html.addClass('no-scroll');
			fixScroll(win.width() - x);
		}
	};
	
	var init = function () {
		
	};
	
	var actions = function () {
		return {
			site: {
				removeScroll: removeScroll,
				addScroll: addScroll
			}
		};
	};

	App.modules.exports('siteScroll', {
		init: init,
		actions: actions
	});
	
})(jQuery);

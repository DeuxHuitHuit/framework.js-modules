/**
 * @author Deux Huit Huit
 * 
 * Auto flickity module
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	var site = $('#site');
	var page = $('.page');
	var o = {
		cellCtn:'.js-auto-flickity-ctn',
		cellSelector: '.js-auto-flickity-item',
		navBtnSelector:'.js-auto-flickity-nav-btn',
		pageDots: false,
		abortedCl:'js-auto-flickity-cancelled',
		prevNextButtons: false
	};

	var onResize = function () {
		$('.is-flickity-inited').each(function () {
			$(this).flickity('resize');
		});
	};
	
	var pageEnter = function (key, data) {
		page = $(data.page.key());

		$(o.cellCtn + ':not(.is-flickity-inited)').each(function() {

			var t = $(this);

			if (t.find(o.cellSelector).length > 1) {
				t.flickity(o).addClass('is-flickity-inited');
				onResize();
			} else {
				t.addClass(o.abortedCl);
				t.find(o.cellSelector).addClass('is-selected');
				t.parent().find(o.navBtnSelector).each(function () {
					$(this).remove();
				});
			}
		});

	};

	var pageLeave = function (key,data) {
		page = $(data.page.key());

		$('.flickity-inited').each(function(){
			$(this).flickity('destroy').removeClass('is-flickity-inited');
		});
	};

	var onNavBtnClick = function (e) {
		var t = $(this);
		var slider = t.parent().children(o.cellCtn);
		var action = t.attr('data-auto-flickity-action');

		if (action) {
			slider.flickity(action, true);
		}

		return window.pd(e);
	};
	
	var init = function () {
		site.on($.click, o.navBtnSelector, onNavBtnClick);
	};
	
	var actions = function () {
		return { 
			site: {
				resize:onResize
			},
			page: {
				enter: pageEnter,
				leave: pageLeave
			}
		};
	};

	var AutoFlickity = App.modules.exports('auto-flickity',  { 
		init: init,
		actions: actions
	});
	
})(jQuery);

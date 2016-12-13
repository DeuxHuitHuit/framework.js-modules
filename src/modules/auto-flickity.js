/**
 * @author Deux Huit Huit
 *
 * Auto flickity module
 * Front-end Integration Hierarchy:
 *
 *  |- FLICKITY CTN : .js-auto-flickity-slider-ctn
 *  |    |- CELL-CTN : .js-auto-flickity-ctn
 *  |    |    |- CELL (REPEATED): .js-auto-flickity-item
 *  |    |    |
 *  |    |- NAV BTNS: .js-auto-flickity-nav-btn
 *
 *  requires https://cdnjs.cloudflare.com/ajax/libs/flickity/1.1.2/flickity.pkgd.min.js
 *
 *  Notes:
 *
 *  Flickity wont be activated if only one cell(o.cellSelector) is
 *  detected. It will add the aborted class(o.abortedCl) on the cell-ctn(o.cellCtn)
 *
 *  You can have more info on the options of Flickity at
 *  http://flickity.metafizzy.co/
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site = $('#site');
	var page = $('.page');
	
	var o = {
		sliderCtn: '.js-auto-flickity-slider-ctn',
		cellCtn: '.js-auto-flickity-ctn',
		cellSelector: '.js-auto-flickity-item',
		navBtnSelector: '.js-auto-flickity-nav-btn',
		
		abortedClass: 'is-flickity-cancelled',
		initedClass: 'is-flickity-inited',
		selectedClass: 'is-selected',
		
		pageDots: false,
		prevNextButtons: false,
		cellAlign: 'left',
		wrapAround: true
	};
	
	var onResize = function () {
		$(o.cellCtn + '.' + o.initedClass).each(function () {
			$(this).flickity('resize');
		});
	};
	
	var pageEnter = function (key, data) {
		page = $(data.page.key());
		
		page.find(o.cellCtn + ':not(' + o.initedClass + ')').each(function () {
			var t = $(this);
			
			if (t.find(o.cellSelector).length > 1) {
				t.flickity(o).addClass(o.initedClass);
				onResize();
			} else {
				t.addClass(o.abortedClass);
				t.find(o.cellSelector).addClass(o.selectedClass);
				t.closest(o.sliderCtn).find(o.navBtnSelector).each(function () {
					$(this).remove();
				});
			}
		});
	};
	
	var pageLeave = function () {
		page.find(o.initedClass).each(function () {
			$(this).flickity('destroy').removeClass(o.initedClass);
		});
		
		page = $();
	};
	
	var onNavBtnClick = function (e) {
		var t = $(this);
		var slider = t.closest(o.sliderCtn).find(o.cellCtn);
		var action = t.attr('data-auto-flickity-action');
		
		if (!!action) {
			slider.flickity(action, true);
		}
		
		return window.pd(e);
	};
	
	var init = function () {
		site.on(App.device.events.click, o.navBtnSelector, onNavBtnClick);
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: pageEnter,
				leave: pageLeave
			}
		};
	};
	
	var AutoFlickity = App.modules.exports('auto-flickity', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var page = $('.page');
	var scrollTimer = 0;
	var resizeTimer = 0;
	var curY = 0;
	var winH = 0;
	var scrollOffsetTop = 0;

	var CTN_SELECTOR = '.js-tcos-3-state-ctn';
	var CONTENT_SELECTOR = '.js-tcos-3-state-content';
	var SECOND_CLASS_ATTR = 'data-tcos-second-state-class';
	var THIRD_CLASS_ATTR = 'data-tcos-third-state-class';

	var OFFSET_SELECTOR = '.js-site-nav';
	var OFFSET_TOP = 'data-tcos-offset-top';
	var OFFSET_BOTTOM = 'data-tcos-offset-bottom';

	var rafTimer;

	var updatePageDock = function () {
		craf(rafTimer);
		rafTimer = raf(function () {
			page.find(CONTENT_SELECTOR).each(function () {
				var t = $(this);
				App.callback(t.data('tcosFx'));
			});
		})
	};

	var setPageDockData = function () {
		page.find(CONTENT_SELECTOR).each(function () {
			var t = $(this);
			var ctn = t.closest(CTN_SELECTOR);

			var ctnOffTop = Math.floor(ctn.offset().top);
			var ctnH = Math.floor(ctn.outerHeight());
			var offTop = Math.floor(t.offset().top);
			var height = Math.floor(t.outerHeight());

			var doIt = function () {
				var fixedClass = !!t.attr(SECOND_CLASS_ATTR) ?
					t.attr(SECOND_CLASS_ATTR) : '';
				var absClass = !!t.attr(THIRD_CLASS_ATTR) ?
					t.attr(THIRD_CLASS_ATTR) : '';

				var offsetTopElement = $();
				if (t.attr('data-tcos-offset-top-selector')) {
					offsetTopElement = $(t.attr('data-tcos-offset-top-selector'));
				}

				var extraOffsetTop = winH * (t.attr('data-tcos-offset-top') || 0) ;
				var extraOffsetBottom = winH * (t.attr('data-tcos-offset-bottom') || 0);

				if (offsetTopElement.length) {
					extraOffsetTop -= offsetTopElement.outerHeight();
				}

				var oTop = ctnOffTop;
				var oBot = ctnOffTop + ctnH;

				var fx = function () {
					t.removeClass(absClass + ' ' + fixedClass);
				};

				if (((oTop + extraOffsetTop) <= curY) &&
					((oBot + extraOffsetBottom) - curY) > height) {
					t.data('tcosFx', function () {
						//Remove step 3
						t.removeClass(absClass);
						//Add Step 2
						t.addClass(fixedClass);
					});
				} else if (((oBot + extraOffsetBottom) - curY) <= height) {
					t.data('tcosFx', function () {
						//Remove Step 2
						t.removeClass(fixedClass);
						//Add Step 3
						t.addClass(absClass);
					});
				} else {
					t.data('tcosFx', function () {
						t.removeClass(absClass + ' ' + fixedClass);
					});
				}
			};

			if (ctn.height() > t.height()) {
				doIt();
			}
		});
	};

	var resetPageDock = function () {
		page.find(CONTENT_SELECTOR).each(function () {
			var t = $(this);
			var fixedClass = !!t.attr(SECOND_CLASS_ATTR) ?
				t.attr(SECOND_CLASS_ATTR) : '';
			var absClass = !!t.attr(THIRD_CLASS_ATTR) ?
				t.attr(THIRD_CLASS_ATTR) : '';
			t.removeClass(fixedClass + ' ' + absClass);
		});
	};

	// SCROLL
	var onScroll = function () {
		scrollOffsetTop = $(OFFSET_SELECTOR).height();

		curY = Math.floor(win.scrollTop() + scrollOffsetTop);
		winH = Math.floor(win.height() - scrollOffsetTop);
		setPageDockData();
	};

	var onPostscroll = function () {
		window.craf(scrollTimer);

		scrollTimer = window.raf(function () {
			updatePageDock();
		});
	};

	var onResize = function () {
		window.craf(resizeTimer);

		resizeTimer = window.raf(function () {
			onScroll();
			onPostscroll();
		});
	};

	// PAGE / ARTICLE CHANGER EVENTS
	var onPageEnter = function (key, data) {
		page = $(data.page.key());

		onScroll();
		onPostscroll();
	};

	var onPageLeave = function (key, data) {
		if (data.canRemove) {
			resetPageDock();
		}
	};

	var onArticleEnter = function () {
		onScroll();
		onPostscroll();
	};

	var onArticleLeave = function () {
		resetPageDock();
	};
	
	var init = function () {
		
	};
	
	var actions = function () {
		return {
			site: {
				scroll: onScroll,
				postscroll: onPostscroll,
				resize: onResize
			},
			page: {
				enter: onPageEnter,
				leave: onPageLeave
			},
			articleChanger: {
				enter: onArticleEnter,
				leave: onArticleLeave
			},
			autoDockedSide: {
				updatePageDocks: updatePageDock
			}
		};
	};
	
	App.modules.exports('auto-toggle-class-on-scroll-3-state', {
		init: init,
		actions: actions
	});
	
})(jQuery);

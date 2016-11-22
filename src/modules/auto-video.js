/**
 * @author Deux Huit Huit
 *
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var page = $('.page');
	var pageVideos = [];
	var resizeTimer = 0;
	
	var AUTO_VIDEO_SELECTOR = '.js-auto-video';
	
	var onVideoPlaying = function (ctn, video) {
		ctn.addClass('is-playing');
	};

	var initVideos = function (ctn) {
		ctn.find(AUTO_VIDEO_SELECTOR).each(function () {
			var t = $(this);
			var v = App.components.create('video', {
				onPlaying: onVideoPlaying
			});

			v.init(t);
			v.load();

			t.addClass('is-loaded');

			pageVideos.push(v);
		});
	};

	var onResize = function () {
		window.craf(resizeTimer);

		resizeTimer = window.raf(function () {
			$.each(pageVideos, function () {
				this.resize();
			});
		});
	};

	var onPageEnter = function (key, data) {
		page = $(data.page.key());

		initVideos(page);
	};

	var onArticleEnter = function (key, data) {
		initVideos(data.article);
	};

	var onPageLeave = function (key, data) {
		if (!!data.canRemove) {
			page.find(AUTO_VIDEO_SELECTOR, function () {
				$(this).removeClass('is-loaded');
			});

			$.each(pageVideos, function () {
				this.destroy();
			});
		}
	};

	var actions = function () {
		return {
			page: {
				enter: onPageEnter,
				leave: onPageLeave
			},
			articleChanger: {
				enter: onArticleEnter
			},
			site: {
				resize: onResize
			}
		};
	};
	
	App.modules.exports('auto-video', {
		actions: actions
	});
	
})(jQuery);

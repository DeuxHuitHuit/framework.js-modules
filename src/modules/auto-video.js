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
	var BTN_PLAY_SEL = '.js-auto-video-play';
	var resizeTimer = 0;
	
	var AUTO_VIDEO_SELECTOR = '.js-auto-video';
	
	var onVideoPlaying = function (ctn, video) {
		App.modules.notify('changeState.update', {
			item: ctn,
			state: 'playing',
			action: 'on'
		});
	};

	var onVideoCanPlay = function (ctn, video) {
		video.addClass('is-loaded');
	};

	var playVideos = function (ctn) {
		ctn.find(AUTO_VIDEO_SELECTOR).each(function () {
			var t = $(this);
			var d = t.data();

			if (d && d.autoVideoComponent) {
				var video = d.autoVideoComponent;

				video.resize();
				video.play();
			} else {
				initVideo(t, {
					onCanPlay: function (ctn, video) {
						onVideoCanPlay(ctn, video);
						video.resize();
						video.play();
					}
				});
			}
		});
	};

	var initVideo = function (video, options) {
		var minimalOptions = {
			onPlaying: onVideoPlaying,
			onLoaded: onVideoCanPlay
		};

		var vOptions = $.extend({}, minimalOptions, options);

		var v = App.components.create('video', vOptions);

		v.init(video);

		video.data['autoVideoComponent'] = v;
	};

	var initVideos = function (ctn) {
		ctn.find(AUTO_VIDEO_SELECTOR).each(function () {
			initVideo($(this));
		});
	};

	var onResize = function () {
		window.craf(resizeTimer);

		resizeTimer = window.raf(function () {
			page.find(AUTO_VIDEO_SELECTOR + '.is-loaded').each(function () {
				var d = $(this).data();
				if (d && d.autoVideoComponent) {
					d.autoVideoComponent.resize();
				}
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
			page.find(AUTO_VIDEO_SELECTOR + '.is-loaded').each(function () {
				var t = $(this);
				var ctn = t.closest('.js-auto-video-ctn');
				var d = t.data();

				if (d && d.autoVideoComponent) {
					d.autoVideoComponent.destroy();
				}
				t.removeClass('is-loaded');
			});
		}
	};

	var onPlayBtnClick = function (e) {
		var vCtn = $(this).closest('.js-auto-video-ctn');

		playVideos(vCtn);

		return window.pd(e);
	};

	var init = function () {
		site.on($.click, BTN_PLAY_SEL, onPlayBtnClick);
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
			},
			video: {
				resize: onResize
			}
		};
	};
	
	App.modules.exports('auto-video', {
		init: init,
		actions: actions
	});
	
})(jQuery);

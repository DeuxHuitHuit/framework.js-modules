/**
 * @author Deux Huit Huit
 */

(function ($, w, win, undefined) {
	
	'use strict';

	var defaultOptions = {
		ctn: $(),
		video: null,
		videoSelector: '.js-video',
		resizeContainerSelector: '',
		onTimeUpdate: $.noop,
		onCanplay: $.noop,
		onPlaying: $.noop,
		resizable: true,
		onLoaded: $.noop
	};

	// jQuery fun
	(function ($) {
		var factory = function (fx) {
			return function () {
				var args = Array.prototype.slice.call(arguments);
				return $(this).each(function (i, e) {
					if (!!e && $.isFunction(e[fx])) {
						e[fx].apply(e, args);
					}
				});
			};
		};
		$.fn.mediaPlay = factory('play');
		$.fn.mediaPause = factory('pause');
		$.fn.mediaLoad = factory('load');
		$.fn.mediaCurrentTime = factory('currentTime');
	})($);
	
	App.components.exports('video', function (options) {
		var o = $.extend({}, defaultOptions, options);

		var RATIO_ATTR = 'data-video-ratio';

		// EVENTS
		var onTimeUpdate = function (e) {
			if (!!status.currentTime) {
				App.mediator.notify('video.timeupdate', {
					video: o.video,
					e: e
				});
			}
			
			App.callback(o.onTimeupdate, [o.video]);
		};

		var onCanplay = function (e) {
			App.callback(o.onCanplay, [o.ctn, o.video]);
		};

		var onPlaying = function (e) {
			App.callback(o.onPlaying, [o.ctn, o.video]);
		};

		var resizeVideo = function () {
			if (!!o.resizable) {
				var ref = !!o.video.closest(o.resizeContainerSelector).length ?
					o.video.closest(o.resizeContainerSelector) : o.ctn;
				var refW = ref.width();
				var refH = ref.height();
				var ratio = o.video.width() / o.video.height();

				var newSize = $.sizing.aspectFill({
					width: refW,
					height: refH,
					preferWidth: false
				}, ratio);

				//Round size to avoid part of pixel
				newSize.height = Math.ceil(newSize.height);
				newSize.width = Math.ceil(newSize.width);

				var newPosition = $.positioning.autoPosition({
					position: 'center',
					left: 'left',
					top: 'top'
				}, $.size(refW, refH), newSize);

				o.video.size(newSize).css(newPosition).data({
					size: newSize,
					position: newPosition
				});
			}
		};

		var onLoaded = function (e) {
			resizeVideo();
			App.callback(o.onLoaded, [o.ctn, o.video]);
		};


		// METHODS
		var loadVideo = function () {
			o.video.mediaLoad();
		};

		var playVideo = function () {
			o.video.mediaPlay();
		};

		var pauseVideo = function () {
			o.video.mediaPause();
		};

		var seekVideo = function (time) {
			o.video.mediaCurrentTime(time);
		};

		var destroy = function () {
			o.video.off('timeUpdate', onTimeUpdate)
				.off('canplay', onCanplay);
			o.video.append(o.originalVideo);
			o.video.remove();
			o.video = o.originalVideo;
		};

		var init = function (ctn, options) {
			o = $.extend({}, o, options);

			o.ctn = $(ctn);
			o.video = ctn.find(o.videoSelector);
			o.originalVideo = o.video;

			// attach events
			o.video.on('timeupdate', onTimeUpdate)
				.on('canplay', onCanplay)
				.on('playing', onPlaying)
				.on('loadedmetadata', onLoaded);
		};
		
		return {
			init: init,
			resize: resizeVideo,
			destroy: destroy,
			load: loadVideo,
			play: playVideo,
			pause: pauseVideo,
			seek: seekVideo
		};
	});
	
})(jQuery, window, jQuery(window));

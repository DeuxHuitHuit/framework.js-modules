/**
 * @author Deux Huit Huit
 * 
 * oEmbed module
 * Supports Youtube and Vimeo APIs
 * 
 * APIS for supported players
 * <!-- Vimeo - Froogaloop -->
 * <script src="//a.vimeocdn.com/js/froogaloop2.min.js"></script>
 * <!-- Youtube iframe api -->
 * <script src="//www.youtube.com/iframe_api"></script>
 * <!-- Player api for dailymotion -->
 * <script src="//api.dmcdn.net/all.js"></script>
 */
(function ($, global, undefined) {

	'use strict';
	
	var	abstractProvider = {
		embed: function (container, id) {
			var iAutoPlayParsed = parseInt(container.attr('data-autoplay'), 10);
			var iRelatedVideo = container.attr('data-rel') === '1' ? 1 : 0;
			var extra = container.attr('data-extra');
			var iframe = this.getIframe(id, iAutoPlayParsed, iRelatedVideo, extra);
			
			iframe.attr('width', '100%');
			iframe.attr('height', '100%');
			iframe.attr('frameborder', '0');
			container.append(iframe);
		},
		
		getIframe : function (id) {
			return $('<iframe allowfullscreen="" />');
		},
		
		play: function (container) {},
		pause: function (container) {}
	};
	
	var $f = function () {
		return global.$f;
	};
	
	var YT = function () {
		return !!global.YT ? global.YT.Player : false;
	};
	
	var vimeoProvider = $.extend({}, abstractProvider, {
		getIframe: function (id, autoplay, rel, extra) {
			autoplay = autoplay !== undefined ? autoplay : 1;
			return abstractProvider.getIframe()
				.attr('src', '//player.vimeo.com/video/' + id +
						'?autoplay=' + autoplay +
						'&api=1&html5=1&rel=' + rel + (extra || ''));
		},
		
		play: function (container) {
			App.loaded($f, function ($f) {
				var player = $f($('iframe', container).get(0));
				
				player.api('play');
			});
		},
		
		pause: function (container) {
			App.loaded($f, function ($f) {
				var player = global.$f($('iframe', container).get(0));
				
				player.api('pause');
			});
		}
	});
	
	var youtubeProvider = $.extend({}, abstractProvider, {
		getIframe: function (url, autoplay, rel, extra) {
			var id = url.indexOf('v=') > 0 ? 
				url.match(/v=([^\&]+)/mi)[1] : url.substring(url.lastIndexOf('/'));
			var autoPlay = autoplay !== undefined ? autoplay : 1;
			var iframe = abstractProvider.getIframe()
				.attr('id', 'youtube-player-' + id)
				.attr('src', '//www.youtube.com/embed/' + id + 
					'?feature=oembed&autoplay=' + autoPlay + 
					'&enablejsapi=1&version=3&html5=1&rel=' + rel + (extra || ''));
			
			App.loaded(YT, function (Player) {
				youtubeProvider._player = new Player(iframe.get(0));
			});
			
			return iframe;
		},
		
		play: function (container) {
			App.loaded(YT, function (Player) {
				this._player.playVideo();
			});
		},
		
		pause: function (container) {
			App.loaded(YT, function (Player) {
				this._player.pauseVideo();
			});
		}
	});

	var providers = {
		Vimeo: vimeoProvider,
		YouTube: youtubeProvider
	};
	
	var loadVideo = function (key, videoContainer) {
		var	videoId = videoContainer.data('videoId');
		var videoProvider = providers[videoContainer.data('videoProvider')];
		
		if (!videoProvider) {
			App.log({args: ['Provider `%s` not found.', videoProvider], me: 'oEmbed', fx: 'warn'});
		} else {
			videoProvider.embed(videoContainer, videoId);
		}
	};
	
	var playVideo = function (key, videoContainer) {
		var	videoId = videoContainer.data('videoId');
		var videoProvider = providers[videoContainer.data('videoProvider')];
		
		if (!videoProvider) {
			App.log({args: ['Provider `%s` not found.', videoProvider], me: 'oEmbed', fx: 'warn'});
		} else {
			videoProvider.play(videoContainer);
		}
	};

	var pauseVideo = function (key, videoContainers) {
		videoContainers.each(function eachVideoContainer(index, container) {
			var videoContainer = $(container);
			var videoId = videoContainer.data('videoId');
			var videoProvider = providers[videoContainer.data('videoProvider')];
			
			if (!!videoProvider && 
				!!videoId && 
				!!videoContainer.find('iframe').length) {
				videoProvider.pause(videoContainer);
			}
		});
	};
	
	var playBtnClicked = function (e) {
		var btn = $(this);
		var item = btn.closest('.item-video');
		var videoContainer = $('.item-video-container', item);
		
		loadVideo(null, videoContainer);
		
		btn.fadeOut();
		$('.item-video-container', item).fadeIn();
		
		return global.pd(e);
	};
	
	var init = function () {
		// capture all click in #site: delegate to the link
		$('#site').on($.click, 'a.play-button', playBtnClicked);
	};
	
	var actions = {
		loadVideo: loadVideo,
		playVideo: playVideo,
		pauseVideo: pauseVideo
	};
	
	var oEmbed = App.modules.exports('oEmbed', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery, window);

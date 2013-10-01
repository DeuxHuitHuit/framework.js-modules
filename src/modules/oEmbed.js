/**
 * @author Deux Huit Huit
 * 
 * oEmbed module
 * Supports Youtube and Vimeo APIs
 * 
 */
(function ($, undefined) {

	"use strict";
	
	var
	
	abstractProvider = {
		embed : function(container,id) {
			var 
			iframe = this.getIframe(id,container.data('autoPlay'));
			
			iframe.attr('width','100%');
			iframe.attr('height','100%');
			container.append(iframe);
			
		},
		
		getIframe : function(id) {
			return $('<iframe/>');
		},
		
		play : function(container){},
		pause : function(container){}
	},
	
	vimeoProvider = $.extend({}, abstractProvider, 
		{
			getIframe : function(id) {
				return $('<iframe src="http://player.vimeo.com/video/' + id + '?autoplay=1&api=1' + '"/>');
			},
			
			play : function(container) {
				var player = window.$f($('iframe',container).get(0));
				
				player.api('play');
			},
			
			pause : function(container) {
				var player = window.$f($('iframe',container).get(0));
				
				player.api('pause');
			}
		}),
	
	youtubeProvider = $.extend({}, abstractProvider, 
		{
			getIframe : function(url,autoplay) {
			
				var id = url.indexOf('v=') > 0 ? url.substring(url.indexOf('v=') + 2) : url.substring(url.lastIndexOf("/"));
				autoplay = autoplay ? autoplay : 1;
				var iframe = $('<iframe id="youtube-player-' + id + '" src="http://www.youtube.com/embed/' + id + '?feature=oembed&autoplay='+autoplay+'&enablejsapi=1&version=3' + '"/>');
				this._player = new window.YT.Player(iframe.get(0));
				return iframe;
			},
			
			play : function(container) {
				this._player.playVideo();
			},
			
			pause : function(container) {
				this._player.pauseVideo();
			}
		}),
	
	providers = {
		'Vimeo' : vimeoProvider,
		'YouTube' : youtubeProvider
	},
	
	loadVideo = function (key, videoContainer) {
		var
		videoId = videoContainer.data('videoId'),
		videoProvider = providers[videoContainer.data('videoProvider')];
		
		videoProvider.embed(videoContainer, videoId);
	},
	
	playVideo = function(key, videoContainer) {
		var
		videoId = videoContainer.data('videoId'),
		videoProvider = providers[videoContainer.data('videoProvider')];
		
		videoProvider.play(videoContainer);
	},

	pauseVideo = function(key, videoContainers) {
		videoContainers.each(function eachVideoContainer(index, container) {
			var
			videoContainer = $(container),
			videoId = videoContainer.data('videoId'),
			videoProvider = providers[videoContainer.data('videoProvider')];
			
			if (!!videoProvider && !!videoId && !!videoContainer.find('iframe').length) {
				videoProvider.pause(videoContainer);
			}
		});
	},
	
	playBtnClicked = function(e) {
		var 
		btn = $(this),
		item = btn.closest('.item-video'),
		videoContainer = $('.item-video-container',item);
		
		loadVideo(null, videoContainer);
		
		btn.fadeOut();
		$('.item-video-container',item).fadeIn();
		
		return window.pd(e);
	},
	
	
	init = function () {
		// capture all click in #site: delegate to the link
		$('#site').on('click', 'a.play-button', playBtnClicked);
	},
	
	// on ready, init the code
	//$(init);
	
	actions = {
		loadVideo: loadVideo,
		playVideo: playVideo,
		pauseVideo: pauseVideo
	},
	
	oEmbed = App.modules.exports('oEmbed', {
		init: init,
		actions : function(){
			return actions;
		}
	});
	
	
	
})(jQuery);

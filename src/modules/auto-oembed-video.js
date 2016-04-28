/**
 * @author Deux Huit Huit
 *
 * module to manage oembed videos
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site;
	var isFirstLoad = true;
	
	var getPage = function () {
		return $('> .page:visible', site.find('#site-pages'));
	};
	
	var onPlayBtnClick = function (e) {
		var t = $(this);
		var vCtn = t.closest('.js-auto-oembed-video-ctn');
		var vPlayer = vCtn.find('.js-auto-oembed-video-player');
		
		if (!$.mobile) {
			App.modules.notify('loadVideo', {
				player: vPlayer,
				autoplay: true
			});
		}
		
		vCtn.addClass('is-playing');
		
		return window.pd(e);
		
	};
	
	var onPageEnter = function () {
		if (!isFirstLoad && $.mobile) {
			loadPageVideo();
		}
	};
	
	var onPageLeave = function () {
		var p = getPage();
		
		p.find('.js-auto-oembed-video-ctn').each(function () {
			var t = $(this);
			var vPlayer = t.find('.js-auto-oembed-video-player');
			
			t.removeClass('is-playing');
			vPlayer.empty();
		});
	};
	
	var onSiteLoaded = function () {
		isFirstLoad = false;
		if ($.mobile) {
			loadPageVideo();
		}
		
	};
	
	var loadPageVideo = function () {
		var p = getPage();
		
		p.find('.js-auto-oembed-video-ctn').each(function () {
			var t = $(this);
			var vPlayer = t.find('.js-auto-oembed-video-player');
			
			App.modules.notify('loadVideo', {
				player: vPlayer
			});
		});
	};
	
	var init = function () {
		site = $('#site');
		
		site.on($.click, '.js-auto-oembed-video-play', onPlayBtnClick);
	};
	
	var actions = function () {
		return {
			page: {
				enter: onPageEnter,
				leaving: onPageLeave
			},
			site: {
				loaded: onSiteLoaded
			}
		};
	};
	
	App.modules.exports('auto-oembed-video', {
		init: init,
		actions: actions
	});
	
})(jQuery);

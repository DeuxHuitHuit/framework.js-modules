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
		
		if (!App.device.mobile) {
			App.modules.notify('loadVideo', {
				player: vPlayer,
				autoplay: true
			});
		}
		
		vCtn.addClass('is-playing');
		
		return window.pd(e);
		
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
	
	var onPageEnter = function () {
		if (!isFirstLoad && App.device.mobile) {
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
		if (App.device.mobile) {
			loadPageVideo();
		}
		
	};
	
	var init = function () {
		site = $('#site');
		
		site.on(App.device.events.click, '.js-auto-oembed-video-play', onPlayBtnClick);
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

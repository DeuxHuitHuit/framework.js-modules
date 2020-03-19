/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Vimeo provider
 *
 *  REQUIRES:
 *      https://player.vimeo.com/api/player.js
 */

(function ($, global, undefined) {

	'use strict';
	
	var VM = function () {
		return global.Vimeo && global.Vimeo.Player;
	};
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var vimeoProvider = $.extend({}, abstractProvider, {
			options: {},
			getIframe: function (id, autoplay, loop, rel, extra) {
				vimeoProvider.options[id].autoplay = autoplay ? (autoplay === 1) : true;
				vimeoProvider.options[id].loop = !isNaN(loop) ? (loop === 1) : true;
				vimeoProvider.options[id].rel = rel;
				// No need to create the iframe: vimeo's SDK is going to do it
				return null;
			},
			
			ready: function (container, callback) {
				var id = container.attr('data-video-id');
				var options = vimeoProvider.options[id];
				App.loaded(VM, function (Player) {
					var player = new Player(container.get(0), {
						id: id,
						background: false,
						autopause: true,
						autoplay: options.autoplay,
						byline: false,
						playsinline: true,
						controls: true,
						loop: options.loop,
						muted: container.attr('data-muted') === '1',
						width: container.width(),
						height: container.height()
					});
					
					player.on('loaded', function () {
						container.find('iframe').attr({
							width: '100%',
							height: '100%'
						});
						if (container.attr('data-volume')) {
							player.setVolume(parseInt(container.attr('data-volume'), 10));
						}
						// The options does not always work, so we force it here.
						player.setLoop(options.loop);
						App.callback(callback, [player]);
					});
				});
			},
			
			play: function (container) {
				App.loaded(VM, function (Player) {
					var player = new Player($('iframe', container).get(0));
					
					player.play();
				});
			},
			
			pause: function (container) {
				App.loaded(VM, function (Player) {
					var player = new Player($('iframe', container).get(0));
					
					player.pause();
				});
			},

			progress: function (container, callback) {
				App.loaded(VM, function (Player) {
					var player = new Player($('iframe', container).get(0));
					player.on('progress', function (e) {
						App.callback(callback, [e.percent * 100]);
					});
				});
			},

			finish: function (container, callback) {
				App.loaded(VM, function (Player) {
					var player = new Player($('iframe', container).get(0));
					player.on('ended', function () {
						App.callback(callback, {
							container: container
						});
					});
				});
			},
			
			volume: function (container, value) {
				App.loaded(VM, function (Player) {
					var player = new Player($('iframe', container).get(0));
					player.setVolume(value);
				});
			},

			requiresVideo: function () {
				return true;
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Vimeo',
			provider: vimeoProvider
		});
	};
	
	App.modules.exports('oembed-vm', {
		init: init
	});
	
})(jQuery, window);

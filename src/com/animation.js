/**
 * Animation component
 *
 * @author Deux Huit Huit
 *
 * @uses lottie
 * @uses jQuery
 * @uses underscore.js
 *
 * REQUIRE: https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.5.7/lottie.min.js
 * DOCS: https://github.com/airbnb/lottie-web
 */
(function ($) {

	'use strict';

	App.components.exports('animation', function (options) {

		var animation = $();
		var renderer = null;
		var isPlaying = false;

		var defaults = {
			renderer: 'svg',
			loop: false,
			onLoaded: $.noop
		};

		/**
		 * Modify the speed of the animation
		 * @param {Number} speed The speed of the animation
		 */
		var setSpeed = function (speed) {
			renderer.setSpeed(speed);
		};

		/**
		 * Go to a specific moment in the animation and pause.
		 * @param {Number} value The wanted position in the timeline
		 * @param {Boolean} isFrame if the value is a specific time on the
		 *                          timeline or a specific frame
		 */
		var goToAndStop = function (value, isFrame) {
			renderer.goToAndStop(value, isFrame);
			isPlaying = false;
		};

		/**
		 * Go to a specific moment in the animation and continue from there.
		 * @param {Number} value The wanted position in the timeline
		 * @param {Boolean} isFrame if the value is a specific time on the
		 *                          timeline or a specific frame
		 */
		var goToAndPlay = function (value, isFrame) {
			renderer.goToAndPlay(value, isFrame);
			isPlaying = true;
		};

		/**
		 * Set the direction of the animation (-1 to play in reverse)
		 * @param {Integer} direction the wanted direction of the animation
		 */
		var setDirection = function (direction) {
			renderer.setDirection(direction);
		};

		/**
		 * Play only parts of an animation
		 * @param {Array} segments range of frame to play [fromFrame, toFrame]
		 * @param {*} force Force the segment to play now
		 */
		var playSegments = function (segments, force) {
			renderer.playSegments(segments, force);
			isPlaying = force;
		};

		/**
		 * Plays the animation.
		 * Please refer to the documentation if this method is not clear enough :)
		 */
		var play = function () {
			renderer.play();
			isPlaying = true;
		};

		/**
		 * Pause the animation
		 */
		var pause = function () {
			renderer.pause();
			isPlaying = false;
		};

		/**
		 * Stop the animation
		 */
		var stop = function () {
			renderer.stop();
			isPlaying = false;
		};

		/**
		 * Destroy the world, and yeah, the animation.
		 */
		var destroy = function () {
			if (!animation || !renderer) {
				return;
			}
			renderer.destroy();
			animation.empty();
			renderer = null;
			isPlaying = false;
		};

		/**
		 * Compute the wanted option for a specific animation with the default values
		 * and the given config in the data-attr.
		 */
		var computeOptions = function () {
			var opts = {};
			var dataAttrPattern = new RegExp('^animation');
			opts = _.reduce(animation.data(), function (memo, value, key) {
				if (dataAttrPattern.test(key)) {
					if (_.isObject(value)) {
						return memo;
					}
					var parsedKey = key.replace(dataAttrPattern, '');
					var validKey = '';
					if (!!parsedKey && !!parsedKey[0]) {
						validKey = parsedKey[0].toLowerCase();
						if (parsedKey.length >= 2) {
							validKey += parsedKey.substr(1);
						}
						memo[validKey] = value;
					}
				}
				return memo;
			}, {});
			return _.assign({
				wrapper: animation.get(0)
			}, defaults, options, opts);
		};

		/**
		 * Render the animation
		 */
		var render = function () {
			renderer = window.lottie.loadAnimation(computeOptions());
			isPlaying = true;
		};

		/**
		 * Just to be sure the library is loaded before making any calls.
		 */
		var airbnblottie = function () {
			return !!window.lottie;
		};

		/**
		 * Check if the animation is inited (It may not play but can be inited).
		 */
		var inited = function () {
			return !!renderer;
		};

		/**
		 * Check if the animation is playing
		 */
		var playing = function () {
			return inited() && isPlaying;
		};

		/**
		 * Get the jQuery element that contains the animation.
		 */
		var get = function () {
			return animation;
		};

		/**
		 * Get the renderer instence used for this specific animation
		 * @returns renderer instence
		 */
		var getRenderer = function () {
			return renderer;
		};

		/**
		 * Set the ctn of the animation and call render if everything is ready
		 * @param {jQuery Element} scope the container of the animation
		 */
		var init = function (scope, opts) {
			options = _.assign({}, defaults, options, opts);
			animation = scope;
			App.loaded(airbnblottie, function () {
				render();
				App.callback(options.onLoaded);
			});
		};

		return {
			init: init,
			inited: inited,
			play: play,
			playing: playing,
			pause: pause,
			stop: stop,
			setSpeed: setSpeed,
			goToAndStop: goToAndStop,
			goToAndPlay: goToAndPlay,
			setDirection: setDirection,
			playSegments: playSegments,
			destroy: destroy,
			get: get,
			getRenderer: getRenderer
		};
	});

})(jQuery);

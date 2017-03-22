/**
 * @author Deux Huit Huit
 *
 *	Flickity component
 */

(function ($, win, undefined) {

	'use strict';

	App.components.exports('flickity', function (options) {
		var slider = $();
		var scope = $();
		var isInited = false;

		var defaultOptions = {
			sliderCtn: '.js-flickity-slider-ctn',
			cellSelector: '.js-flickity-cell',
			navBtnSelector: '.js-flickity-nav-btn',

			abortedClass: 'is-flickity-cancelled',
			initedClass: 'is-flickity-inited',
			selectedClass: 'is-selected',
			seenClass: 'is-seen',

			dataAttrPrefix: 'flickity'
		};

		var o = $.extend({}, defaultOptions, options);

		var flickityOptions = function () {
			var opts = {};
			var dataAttrPattern = new RegExp('^' + o.dataAttrPrefix);
			opts = _.reduce(slider.data(), function (memo, value, key) {
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
			return $.extend({}, o, opts);
		};

		var resize = function () {
			slider.flickity('resize');
		};

		var setActiveSlideSeen = function () {
			var currentSlide = slider.data('flickity').selectedIndex;

			slider.find(o.cellSelector + ':eq(' + currentSlide + ')').addClass(o.seenClass);

			slider.find(o.cellSelector + '.' + o.seenClass).each(function () {
				slider.find('.flickity-page-dots li:eq(' + $(this).index() + ')')
					.addClass(o.seenClass);
			});

		};
		
		var init = function (item, s) {
			slider = item;
			scope = s;

			if (slider.find(o.cellSelector).length > 1) {

				var flickOptions = flickityOptions();

				slider.flickity(flickOptions);
				slider.flickity('resize');
				slider.addClass(o.initedClass);
				isInited = true;

				if (!!flickOptions.pageDots) {
					slider.on('settle.flickity', setActiveSlideSeen);
				}
				slider.find('img[data-src-format]').jitImage();
				App.callback(o.inited);
			} else if (slider.find(o.cellSelector.length == 1)) {
				slider.addClass(o.abortedClass);
				slider.find(o.cellSelector).addClass(o.selectedClass);
				App.callback(o.aborted);
			}
		};

		var destroy = function () {
			if (slider.hasClass(o.initedClass) && slider.closest('body').length > 0) {
				slider.flickity('destroy');
				slider.removeClass(o.initedClass);
				slider.off('settle.flickity', setActiveSlideSeen);
				slider = $();
				App.callback(o.destroyed);
			}
		};

		return {
			init: init,
			resize: resize,
			destroy: destroy,
			isInited: function () {
				return isInited;
			}
		};
	});

})(jQuery, jQuery(window));

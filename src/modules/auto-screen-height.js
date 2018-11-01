/**
 *  @author Deux Huit Huit
 *
 *  Auto screen height
 */
(function ($, undefined) {

	'use strict';

	var win = $(window);
	var site = $('#site');

	var mobileHeight = 0;

	var platforms = {
		all: true,
		desktop: !App.device.mobile,
		tablette: App.device.tablet,
		mobile: App.device.mobile,
		phone: $.phone
	};

	var getOffsetTotal = function (itemsArray) {
		var total = 0;

		if (itemsArray) {
			var its = itemsArray.split(',');
			$.each(its, function (i, value) {
				total += $(value).height();
			});
		}
		return total;
	};

	var processPlatforms = function (itemsArray) {
		var result = false;

		if (itemsArray) {

			var its = itemsArray.split(',');
			$.each(its, function (i, value) {
				if (platforms[value]) {
					result = true;
				}
			});
		}
		return result;
	};

	var resizeItem = function () {
		var t = $(this);
		var winWidth = win.width();
		var ratio = t.attr('data-height-ratio') || 1;
		var fx = t.attr('data-height-property') || 'minHeight';
		var offset = getOffsetTotal(t.attr('data-height-offset'));
		var newHeight = (win.height() - offset) * ratio;
		var platformsVal = processPlatforms(t.attr('data-screen-height-platform') || 'all');
		var minWidth = parseInt(t.attr('data-screen-height-min-width'), 10) || 0;
		var maxWidth = parseInt(t.attr('data-screen-height-max-width'), 10) || 0;
		var useMediaQuery = t.attr('data-screen-height-use-media-query');
		var useJitImage = t.attr('data-screen-height-jitimage') || true;
		var makeMediaQuery = function makeMediaQuery () {
			var result = '';

			var hasMinWidth = minWidth !== 0;
			var hasMaxWidth = maxWidth !== 0;

			if (hasMinWidth) {
				result = '(min-width: ' + minWidth + 'px)';
			}
			if (hasMinWidth && hasMaxWidth) {
				result += ' and ';
			}
			if (hasMaxWidth) {
				result += '(max-width: ' + maxWidth + 'px)';
			}
			return result;
		};
		var mediaQuery = makeMediaQuery();
		var boolUseMediaQuery = true;	//True by default
		if (useMediaQuery && useMediaQuery.length) {
			boolUseMediaQuery = useMediaQuery === 'true';
		}

		//Disable Media Query when not supported
		boolUseMediaQuery = !!window.matchMedia && boolUseMediaQuery;

		//test platforms
		if (platformsVal &&
			!boolUseMediaQuery &&
			winWidth > minWidth &&
			(maxWidth === 0 || winWidth < maxWidth)) {

			t.css(fx, newHeight);
		} else if (platformsVal &&
			boolUseMediaQuery &&
			(mediaQuery.length === 0 || window.matchMedia(mediaQuery).matches)) {

			t.css(fx, newHeight);
		} else {
			t.css(fx, '');
		}

		if (useJitImage) {
			$('img[data-src-format]', t).jitImage();
		}
	};

	var onResize = function (e) {
		if ((App.device.mobile && Math.abs(mobileHeight - win.height()) > 120) ||
			!App.device.mobile) {
			site.filter('.js-auto-screen-height')
				.add($('.js-auto-screen-height', site))
				.each(resizeItem);
			mobileHeight = win.height();
		}
	};

	var onEnter = function () {
		mobileHeight = 0;
		onResize();
		if (App.device.mobile) {
			mobileHeight = win.height();
		}
		setTimeout(onResize, 100);
	};

	var init = function () {
		onResize();
		if (App.device.mobile) {
			mobileHeight = win.height();
		}
	};

	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: onEnter
			},
			autoScreenHeight: {
				update: onResize
			},
			articleChanger: {
				entering: onResize
			}
		};
	};

	App.modules.exports('auto-screen-height', {
		init: init,
		actions: actions
	});

})(jQuery);

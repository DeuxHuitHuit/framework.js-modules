/**
 * Watermark
 * @author Deux Huit Huit
 */
(function ($, undefined) {

	'use strict';

	var site = $('#site');

	var sels = {
		ctn: '.js-watermark-ctn'
	};

	var DELAY = 3000;

	var onSiteLoaded = function () {
		setTimeout(function () {
			site.find(sels.ctn).each(function () {
				var t = $(this);
				if (!!t.attr('data-href') && !t.html()) {
					$.ajax({
						method: 'GET',
						crossDomain: true,
						url: t.attr('data-href'),
						success: function (data) {
							t.append($(data).find('watermark').html());
						}
					});
				}
			});
		}, DELAY);
	};

	var actions = function () {
		return {
			site: {
				loaded: onSiteLoaded
			}
		};
	};

	App.modules.exports('watermark', {
		actions: actions
	});

})(jQuery);

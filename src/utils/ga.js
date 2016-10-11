/**
 * @author Deux Huit Huit
 *
 * Google Analytics wrapper
 */

(function ($) {
	'use strict';
	
	var lang = $('html').attr('lang');
	
	var log = function () {
		var args = [];
		$.each(arguments, function (i, a) {
			if ($.isPlainObject(a)) {
				a = JSON.stringify(a, null, 2);
			} else {
				a = '"' + a + '"';
			}
			args.push(a);
		});
		App.log({args: ['%cga(' + args.join(',') + ');', 'color:navy']});
	};
	
	var getGa = function () {
		/* jshint ignore:start */
		if (!!window.dataLayer && !!window.dataLayer.push) {
			return function ga(gaAction, gaCat, cat, action, label, value, options, category) {
				if (gaCat === 'pageview') {
					dataLayer.push($.extend({}, cat, {
						event: 'pageview',
						page: {
							requestURI: cat.page || cat.location,
							language: lang
						}
					}));
				}
				else if (gaCat === 'event') {
					var args = {
						event: cat,
						eventCategory: category,
						eventAction: action,
						eventLabel: label,
						eventValue: value,
						eventOptions: options
					};
					if ($.isPlainObject(cat)) {
						args.event = undefined;
						args = $.extend(true, {}, args, cat);
					}
					dataLayer.push(args);
				}
			};
		}
		/* jshint ignore:end */
		return window.ga || log;
	};
	
	// ga facilitators
	$.sendPageView = function (opts) {
		var ga = getGa();
		var defaults = {
			page: window.location.pathname + window.location.search,
			location: window.location.href,
			hostname: window.location.hostname
		};
		var args = !opts ? defaults : $.extend(defaults, opts);
		if ($.isFunction($.formatPage)) {
			args.page = $.formatPage(args.page);
		}
		if ($.isFunction($.formatLocation)) {
			args.location = $.formatLocation(args.location);
		}
		ga('send', 'pageview', args);
	};
	
	$.sendEvent = function (cat, action, label, value, options, category) {
		var ga = getGa();
		ga('send', 'event', cat, action, label, value, options || {nonInteraction: 1}, category);
	};
	
	$.fn.sendClickEvent = function (options) {
		options = options || {};
		var t = $(this).eq(0);
		if (!options.action) {
			options.action = 'click';
		}
		if (!options.label) {
			options.label = $.trim(t.text());
		}
		var o = $.extend({}, options, {
			cat: t.attr('data-ga-cat') || undefined,
			category: t.attr('data-ga-category') || undefined,
			action: t.attr('data-ga-action') || undefined,
			label: t.attr('data-ga-label') || undefined,
			value: parseInt(t.attr('data-ga-value'), 10) || undefined
		});
		if (!o.cat) {
			App.log({fx: 'err', args: 'No ga-cat found. Cannot continue.'});
			return;
		}
		if (!o.label) {
			App.log({fx: 'err', args: 'No ga-label found. Reverting to text'});
		}
		$.sendEvent(o.cat, o.action, o.label, o.value, undefined, o.category);
	};
	
	// auto-hook
	$(function () {
		var loc = window.location;
		var origin = loc.origin || (loc.protocol + '//' + loc.hostname);
		var internalLinksExclusion = ':not([href^="' + origin + '"])';
		var externalLinks = 'a[href^="http://"]' + internalLinksExclusion +
			', a[href^="https://"]' + internalLinksExclusion;
		var mailtoLinks = 'a[href^="mailto:"]';
		var telLinks = 'a[href^="tel:"]';
		var downloadExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xsl', 'xslx'];
		var downloadLinks = _.map(downloadExtensions, function (ext) {
			return 'a[href$=".' + ext + '"], ';
		}).join('') + 'a[href$="?dl"], a[download]';
		$('#site').on($.click, '[data-ga-cat]', function (e) {
			$(this).sendClickEvent();
		})
		.on($.click, externalLinks, function (e) {
			$(this).sendClickEvent({
				cat: 'link-external'
			});
		})
		.on($.click, downloadLinks, function (e) {
			$(this).sendClickEvent({
				cat: 'link-download'
			});
		})
		.on($.click, mailtoLinks, function (e) {
			$(this).sendClickEvent({
				cat: 'link-mailto'
			});
		})
		.on($.click, telLinks, function (e) {
			$(this).sendClickEvent({
				cat: 'link-tel'
			});
		});
		if ($('body').hasClass('page-404')) {
			$.sendEvent('erreur 404', 'erreur 404', document.referrer);
		}
	});
	
})(jQuery);

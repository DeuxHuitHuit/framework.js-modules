/**
 * @author Deux Huit Huit
 *
 * Google Analytics wrapper
 */

(function ($) {
	'use strict';
	
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
		App.log({args: ['%cga(' + args.join(',') + ');', 'color:red']});
	};
	
	// ga facilitators
	$.sendPageView = function (opts) {
		var ga = window.ga || log;
		var defaults = {
			page: window.location.pathname + window.location.search,
			location: window.location.href,
			hostname: window.location.hostname
		};
		var args = !opts ? defaults : $.extend(defaults, opts);
		
		ga('send', 'pageview', args);
	};
	
	$.sendEvent = function (cat, action, label, value, options) {
		var ga = window.ga || log;
		ga('send', 'event', cat, action, label, value, options || {nonInteraction: 1});
	};
	
	$.fn.sendClickEvent = function (options) {
		var t = $(this).eq(0);
		var gaValue = t.attr('data-ga-value');
		var gaCat = t.attr('data-ga-cat');
		var o = $.extend({}, options, {
			cat: !!gaCat ? gaCat : 'click',
			event: 'click',
			value: !!gaValue ? gaValue : t.text()
		});
		if (!gaValue) {
			App.log('No ga-value found, reverting to text');
		}
		$.sendEvent(o.cat, o.event, 'click-event', o.value);
	};
	
	// auto-hook
	$(function () {
		$('#site').on($.click, '*[data-ga-value]', function (e) {
			$(this).sendClickEvent();
		});
	});
	
})(jQuery);
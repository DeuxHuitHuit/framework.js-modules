/**
 * @author Deux Huit Huit
 *
 * Cloudflare email protection
 */
(function ($, undefined) {

	'use strict';
	var pattern = /^\[email(.+)protected\]$/i;
	var doIt = function () {
		$('a[href^="/cdn-cgi/l/email-protection"]').each(function (i, e) {
			/* jshint ignore:start */
			try {
				e = $(e);
				var a = e.attr('href').split('#')[1];
				if (a.indexOf('?') !== -1) {
					a = a.split('?')[0];
				}
				if (a) {
					var j,c,s = '';
					var r = parseInt(a.substr(0, 2), 16);
					if (r) {
						for (j = 2; j < a.length; j += 2) {
							c = parseInt(a.substr(j, 2), 16) ^ r;
							s += String.fromCharCode(c);
						}
						e.attr('href', 'mailto:' + s);
						e.find('script').remove();
						var span = e.find('.__cf_email__');
						if (!!span.length) {
							e = span;
						}
						if (pattern.test(_.string.trim(e.text()))) {
							e.text(s);
						}
					}
				}
			} catch (e) {}
			/* jshint ignore:end */
		});
	};

	var actions = function () {
		return {
			page: {
				enter: doIt
			},
			articleChanger: {
				enter: doIt
			}
		};
	};
	
	App.modules.exports('cloudflare-email', {
		actions: actions
	});
	
})(jQuery, window);

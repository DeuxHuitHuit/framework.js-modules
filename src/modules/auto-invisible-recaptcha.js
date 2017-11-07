/**
 *  @author Deux Huit Huit
 *
 *  Auto Invisible ReCaptcha
 *  
 *  @requires
 *    https://www.google.com/recaptcha/api.js?onload=GoogleReCaptchaCallback&amp;render=explicit
 *    https://github.com/SagaraZD/google_recaptcha
 *    In the form
 *    <input type="hidden" name="fields[google_recaptcha]" class="js-recaptcha-response" />
 *    On the button
 *    <add class="js-recaptcha" />
 *    <set data-sitekey="{/data/params/recaptcha-sitekey}" />
 */
(function ($, undefined) {
	'use strict';

	var site = $('#site');
	var options = {
		target: '.js-recaptcha-response',
		trigger: '.js-recaptcha',
		prefix: 'g-recaptcha-'
	};
	var page = null;
	var loaded = false;
	var ids = 0;

	var load = function () {
		if (!loaded || !page) {
			return;
		}
		page.find(options.trigger).each(function () {
			var t = $(this);
			if (t.attr('id')) {
				return;
			}
			var id = options.prefix + (++ids);
			t.attr('id', id);
			window.grecaptcha.render(id, {
				sitekey: t.attr('data-sitekey'),
				callback: function (result) {
					page.find(options.target).val(result);
					App.mediator.notify('recaptcha.updated', {
						result: result,
						lastTarget: t
					});
				}
			});
		});
	};

	var pageEnter = function (key, data) {
		page = $(data.page.key());
		load();
	};

	var init = function () {
		window.GoogleReCaptchaCallback = function () {
			loaded = true;
			load();
		};
	};
	
	var actions = function () {
		return {
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			}
		};
	};
	
	App.modules.exports('auto-invisible-recaptcha', {
		init: init,
		actions: actions
	});
	
})(jQuery);

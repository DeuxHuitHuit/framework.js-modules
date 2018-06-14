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

	var load = function (ctn) {
		if (!loaded || !ctn) {
			return;
		}
		ctn.find(options.trigger).each(function () {
			var t = $(this);
			if (t.attr('id')) {
				return;
			}
			var id = options.prefix + (++ids);
			t.attr('id', id);
			var recaptchaId = window.grecaptcha.render(id, {
				sitekey: t.attr('data-sitekey'),
				callback: function (result) {
					ctn.find(options.target).val(result);
					App.mediator.notify('recaptcha.updated', {
						result: result,
						lastTarget: t
					});
				}
			});
			t.data('recaptcha-id', recaptchaId);
		});
	};

	var onForceUpdate = function () {
		try {
			if (!!window.grecaptcha) {
				window.grecaptcha.reset();
			} else {
				App.log('Recaptcha Lib not found');
			}
		} catch (e) {
			App.log('Recaptcha Force update fail with error');
		}
	};

	var pageEnter = function (key, data) {
		if (!!data.page) {
			page = $(data.page.key());
		} else if (!!data.article) {
			page = $(data.article);
		}
		load(page);
	};

	var init = function () {
		window.GoogleReCaptchaCallback = function () {
			loaded = true;
			load(site);
		};
	};

	var actions = function () {
		return {
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			},
			recaptcha: {
				forceUpdate: onForceUpdate
			}
		};
	};

	App.modules.exports('auto-invisible-recaptcha', {
		init: init,
		actions: actions
	});

})(jQuery);

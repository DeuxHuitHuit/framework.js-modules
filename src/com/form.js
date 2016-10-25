/**
 * @author Deux Huit Huit
 *
 * Form
 *
 */
(function ($, w, doc, undefined) {

	'use strict';
	
	var defaults = {
		root: 'body',
		container: '.js-form',
		fields: '.js-form-field',
		fieldsOptions: {
			
		},
		onSubmit: null,
		doSubmit: null,
		onValid: null,
		onError: null,
		disableOnSubmit: true,
		focusOnError: true,
		post: {
			
		}
	};
	
	App.components.exports('form', function _form(options) {
		var ctn;
		var validator;
		var fields = [];
		var isSubmitting = false;
		options = $.extend({}, options, defaults);
		
		var reset = function () {
			ctn[0].reset();
			_.each(fields, function (f) {
				f.reset();
			});
		};
		
		var validate = function () {
			return _.map(fields, function (f) {
				return f.validate();
			});
		};
		
		var isValid = function (results) {
			results = results || validate();
			return !!results.length && !_.some(results);
		};
		
		var enable = function (enabl) {
			_.each(fields, function (f) {
				f.enable(enabl);
			});
		};
		
		var post = function () {
			var data = {};
			var processData = !window.FormData;
			
			if (isSubmitting) {
				return;
			}
			
			if (!processData) {
				data = new FormData(ctn[0]);
			}
			else {
				$.each(ctn.serializeArray(), function () {
					data[this.name] = this.value;
				});
			}
			
			isSubmitting = true;
			
			window.Loader.load({
				url : ctn.attr('action'),
				type: ctn.attr('method') || 'POST',
				data: data,
				processData: processData,
				contentType: false,
				dataType: 'text',
				error: options.post.error,
				success: options.post.success,
				complete: function () {
					App.callback(options.post.complete);
					isSubmitting = false;
					if (options.disableOnSubmit) {
						enable(true);
					}
				}
			});
		};
		
		var onSubmit = function (e) {
			var results = validate();
			App.callback(options.onSubmit);
			
			if (isValid(results)) {
				App.callback(options.onValid);
				if (!!options.post) {
					post();
				} else {
					App.callback(options.doSubmit);
				}
				
				if (options.disableOnSubmit) {
					enable(false);
				}
				
				if (!!options.post || !!options.doSubmit) {
					return w.pd(e);
				}
			}
			else {
				App.callback(options.onError, {
					results: results
				});
				if (options.focusOnError) {
					_.filter(results)[0].field.focus();
				}
				
				return w.pd(e);
			}
		};
		
		var initField = function (i, t) {
			t = $(t);
			var field = App.components.create('form-field', options.fieldsOptions);
			field.init({
				container: t
			});
			fields.push(field);
		};
		
		var init = function (o) {
			options = $.extend(true, options, o);
			options.root = $(options.root);
			ctn = options.root.find(options.container);
			ctn.find(options.fields).each(initField);
			ctn.submit(onSubmit);
			w.validate.validators.presence.options = {
				message: ctn.attr('data-msg-required')
			};
			w.validate.validators.email.options = {
				message: ctn.attr('data-msg-email-invalid')
			};
		};
		
		return {
			init: init,
			enable: enable,
			validate: validate,
			reset: reset,
			post: post,
			container: function () {
				return ctn;
			}
		};
	});
	
})(jQuery, window, document);

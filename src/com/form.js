/**
 * @author Deux Huit Huit
 *
 * Form
 *
 */
(function ($, w, doc, moment, undefined) {

	'use strict';
	
	var defaults = {
		root: 'body',
		container: '.js-form',
		fields: '.js-form-field',
		fieldsGroupSelector: '.js-form-field-group',
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
	
	App.components.exports('form', function _form (options) {
		var ctn;
		var validator;
		var fields = [];
		var isSubmitting = false;
		options = $.extend(true, {}, defaults, options);
		
		var reset = function () {
			ctn[0].reset();
			_.each(fields, function (f) {
				f.reset();
			});
		};
		
		var preview = function () {
			_.each(fields, function (f) {
				f.preview();
			});
		};
		
		var validate = function () {
			return _.map(fields, function (f) {
				return f.validate();
			});
		};
		
		var isValid = function (results) {
			results = results || validate();
			return (!!results.length && !_.some(results)) || !results.length;
		};
		
		var validateGroup = function (group) {
			var groupFields = [];

			$.each(fields, function () {
				if (this.group().is(group)) {
					groupFields.push(this);
				}
			});

			return isValid(_.map(groupFields, function (f) {
				return f.validate();
			}));
		};
		
		var enable = function (enabl) {
			_.each(fields, function (f) {
				f.enable(enabl);
			});
		};
		
		var submitting = function (submitting) {
			_.each(fields, function (f) {
				f.submitting(submitting);
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
			submitting(isSubmitting);
			
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
					submitting(isSubmitting);
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
					results = _.filter(results);
					if (!!results.length) {
						results[0].field.focus();
					}
				}
				
				return w.pd(e);
			}
		};
		
		var initField = function (i, t) {
			t = $(t);
			var field = App.components.create('form-field', options.fieldsOptions);

			field.init({
				container: t,
				group: t.closest(options.fieldsGroupSelector)
			});
			fields.push(field);
		};
		
		var init = function (o) {
			options = $.extend(true, options, o);
			options.root = $(options.root);
			ctn = options.root.find(options.container);
			ctn.find(options.fields).each(initField);
			ctn.submit(onSubmit);
			// Default validators message
			w.validate.validators.presence.options = {
				message: ctn.attr('data-msg-required')
			};
			w.validate.validators.email.options = {
				message: ctn.attr('data-msg-email-invalid') || ctn.attr('data-msg-invalid')
			};
			w.validate.validators.format.options = {
				message: ctn.attr('data-msg-invalid')
			};
			w.validate.validators.numericality.options = {
				message: ctn.attr('data-msg-invalid')
			};
			w.validate.validators.url.options = {
				message: ctn.attr('data-msg-invalid')
			};
			var dateFormat = 'DD-MM-YYYY';
			w.validate.extend(w.validate.validators.datetime, {
				// must return a millisecond timestamp
				// also used to parse earlier and latest options
				parse: function (value, options) {
					if (!value) {
						return NaN;
					}
					if (moment.isMoment(value)) {
						return +value;
					}
					if (/[^\d-\/]/.test(value)) {
						return NaN;
					}
					var date = moment.utc(value, dateFormat);
					if (!date.isValid()) {
						return NaN;
					}
					// coerce to ms timestamp
					return +date;
				},
				// must return a string
				format: function (value, options) {
					if (!moment.isMoment(value)) {
						value = moment(value);
					}
					return value.format(dateFormat);
				},
				message: ctn.attr('data-msg-date-invalid') || ctn.attr('data-msg-invalid'),
				notValid: ctn.attr('data-msg-date-invalid') || ctn.attr('data-msg-invalid'),
				tooEarly: ctn.attr('data-msg-date-too-early') || ctn.attr('data-msg-invalid'),
				tooLate: ctn.attr('data-msg-date-too-late') || ctn.attr('data-msg-invalid')
			});
		};
		
		return {
			init: init,
			enable: enable,
			validate: validate,
			reset: reset,
			preview: preview,
			post: post,
			submitting: submitting,
			validateGroup: validateGroup,
			container: function () {
				return ctn;
			},
			eachFields: function (cb) {
				return _.each(fields, cb);
			}
		};
	});
	
})(jQuery, window, document, window.moment);

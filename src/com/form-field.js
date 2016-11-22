/**
 * @author Deux Huit Huit
 *
 * Form Field
 *
 */
(function ($, w, doc, moment, undefined) {

	'use strict';
	
	var defaults = {
		container: '.js-form-field',
		input: '.js-form-input',
		error: '.js-form-error',
		label: '.js-form-label',
		states: '.js-form-state',
		clear: '.js-form-clear',
		preview: '.js-form-preview',
		progress: '.js-form-progress',
		validationEvents: 'blur change',
		emptinessEvents: 'blur keyup change',
		previewEvents: 'change input',
		onlyShowFirstError: false,
		group: null,
		rules: {
			required: {
				presence: true
			},
			email: {
				email: true
			},
			money: {
				numericality: {
					onlyInteger: false,
					greaterThan: 0
				}
			},
			integer: {
				numericality: {
					onlyInteger: true,
					greaterThan: 0
				}
			},
			document: {
				format: {
					pattern: '^.+\\.(?:docx?|pdf)$',
					flags: 'i'
				}
			},
			image: {
				format: {
					pattern: '^.+\\.(?:jpe?g|png)$',
					flags: 'i'
				}
			},
			dateNaissance: {
				datetime: {
					dateOnly: true,
					earliest: moment.utc().subtract(30, 'years'),
					latest: moment.utc().subtract(18, 'years')
				}
			},
			phone: {
				format: {
					pattern: '\\(?[0-9]{3}\\)?[- ]?([0-9]{3})[- ]?([0-9]{4})',
					flags: 'i'
				}
			},
			url: {
				url: true
			},
			embed: {
				format: {
					pattern: '^http(.+)(youtube\\.com|youtu\\.be|vimeo\\.com|facebook\\.com)(.+)$',
					flags: 'i'
				}
			}
		},
		rulesOptions: {
			
		}
	};
	
	App.components.exports('form-field', function _formField (options) {
		var ctn;
		var input;
		var error;
		var label;
		var states;
		var clear;
		var progress;
		var rules = [];
		var self;

		options = $.extend(true, {}, defaults, options);

		var getStateClasses = function (t) {
			return {
				error: t.attr('data-error-class'),
				valid: t.attr('data-valid-class'),
				empty: t.attr('data-empty-class'),
				notEmpty: t.attr('data-not-empty-class'),
				submitting: t.attr('data-submitting-class')
			};
		};
		
		var getStateClass = function (state) {
			return state.attr('data-state-class');
		};
		
		var setStateClass = function (fx, s) {
			var state = states.filter('[data-state="' + s + '"]');
			state[fx](getStateClass(state));
		};
		
		var enable = function (enable) {
			if (enable) {
				input.enable();
			}
			else {
				input.disable();
			}
		};
		
		var focus = function () {
			input.focus();
		};
		
		var reset = function () {
			var inputClasses = getStateClasses(input);
			var ctnClasses = getStateClasses(ctn);
			var labelClasses = getStateClasses(label);
			input.removeClass(inputClasses.error);
			input.removeClass(inputClasses.valid);
			input.addClass(inputClasses.empty);
			input.removeClass(inputClasses.notEmpty);
			ctn.removeClass(ctnClasses.error);
			ctn.removeClass(ctnClasses.valid);
			ctn.addClass(ctnClasses.empty);
			ctn.removeClass(ctnClasses.notEmpty);
			label.removeClass(labelClasses.error);
			label.removeClass(labelClasses.valid);
			label.addClass(labelClasses.empty);
			label.removeClass(labelClasses.notEmpty);
			error.empty().removeClass(getStateClass(error));
			setStateClass('removeClass', 'error');
			setStateClass('removeClass', 'valid');
		};
		
		var previewFile = function (ctn, file) {
			ctn.empty();
			if (!!file && !!w.FileReader) {
				var reader = new w.FileReader();
				reader.onload = function readerLoaded (event) {
					var r = event.target.result;
					if (!!r) {
						var img = $('<img />')
							.attr('class', ctn.attr('data-preview-class'))
							.attr('src', r)
							.on('error', function () {
								img.remove();
							});
						ctn.append(img);
					}
				};
				reader.readAsDataURL(file);
			}
		};
		
		var preview = function (e) {
			var p = ctn.find(options.preview);
			if (!!p.length) {
				if (input.attr('type') == 'file') {
					var file = !!e && !!e.target.files && e.target.files[0];
					file = file || (input[0].files && input[0].files[0]);
					previewFile(p, file);
				}
			}
		};
		
		var tryValidate = function (value) {
			try {
				var constraints = {};
				var rulesOptions = {};
				_.each(rules, function (rule) {
					if (!!options.rules[rule]) {
						constraints = $.extend(constraints, options.rules[rule]);
					}
					if (!!options.rulesOptions[rule]) {
						rulesOptions = $.extend(rulesOptions, options.rulesOptions[rule]);
					}
				});
				
				return w.validate.single(value, constraints, rulesOptions);
			}
			catch (ex) {
				App.log({fx: 'error', args: [ex]});
			}
			return false;
		};
		
		var value = function () {
			var value;
			if (input.attr('type') == 'checkbox') {
				value = input.prop('checked') ? 'true' : '';
			} else if (input.attr('type') == 'radio') {
				//Get grouped item
				var goodInput = input.closest('form').
					find('input[type=\'radio\'][name=\'' + input.attr('name') + '\']:checked');
				if (!!goodInput.length) {
					value = goodInput.prop('checked') ? 'true' : '';
				} else {
					value = input.prop('checked') ? 'true' : '';
				}
			} else {
				value = input.val();
			}
			return value;
		};
		
		var validate = function () {
			var result = tryValidate(value());
			
			var errorFx = !result ? 'removeClass' : 'addClass';
			var validFx = !result ? 'addClass' : 'removeClass';
			var errorMessages = !result ? '' :
				(options.onlyShowFirstError ? result[0] : result.join('<br />'));
			var inputClasses = getStateClasses(input);
			var ctnClasses = getStateClasses(ctn);
			var labelClasses = getStateClasses(label);
			
			input[errorFx](inputClasses.error);
			input[validFx](inputClasses.valid);
			
			ctn[errorFx](ctnClasses.error);
			ctn[validFx](ctnClasses.valid);
			
			label[errorFx](labelClasses.error);
			label[validFx](labelClasses.valid);
			
			error.html(errorMessages);
			
			if (!result) {
				// valid!
				error.removeClass(getStateClass(error));
				setStateClass('addClass', 'valid');
				setStateClass('removeClass', 'error');
				return result;
			}
			error.addClass(getStateClass(error));
			setStateClass('addClass', 'error');
			setStateClass('removeClass', 'valid');
			return {
				result: result,
				field: self
			};
		};
		
		var checkEmptiness = function () {
			var valueIsEmpty = w.validate.isEmpty(value());
			var emptyFx = valueIsEmpty ? 'addClass' : 'removeClass';
			var notEmptyFx = valueIsEmpty ? 'removeClass' : 'addClass';
			var inputClasses = getStateClasses(input);
			var ctnClasses = getStateClasses(ctn);
			var labelClasses = getStateClasses(label);
			input[emptyFx](inputClasses.empty);
			input[notEmptyFx](inputClasses.notEmpty);
			ctn[emptyFx](ctnClasses.empty);
			ctn[notEmptyFx](ctnClasses.notEmpty);
			label[emptyFx](labelClasses.empty);
			label[notEmptyFx](labelClasses.notEmpty);
		};
		
		var submitting = function (submitting) {
			var submittingFx = submitting ? 'addClass' : 'removeClass';
			var inputClasses = getStateClasses(input);
			input[submittingFx](inputClasses.submitting);
		};
		
		var init = function (o) {
			options = $.extend(true, options, o);
			ctn = $(options.container);
			input = ctn.find(options.input);
			error = ctn.find(options.error);
			label = ctn.find(options.label);
			states = ctn.find(options.states);
			clear = ctn.find(options.clear);
			progress = ctn.find(options.progress);
			rules = _.filter((ctn.attr('data-rules') || '').split(/[|,\s]/g));

			if (!!options.validationEvents) {
				input.on(options.validationEvents, validate);
			}
			if (!!options.emptinessEvents) {
				input.on(options.emptinessEvents, checkEmptiness);
			}
			if (!!options.previewEvents) {
				input.on(options.previewEvents, preview);
			}
		};
		
		self = {
			init: init,
			validate: validate,
			enable: enable,
			focus: focus,
			reset: reset,
			preview: preview,
			checkEmptiness: checkEmptiness,
			group: function () {
				return options.group;
			},
			submitting: submitting,
			value: value,
			name: function () {
				return input.attr('name');
			},
			label: function () {
				return label.text();
			},
			find: function (sel) {
				if (ctn.is(sel)) {
					return ctn;
				}
				return ctn.find(sel);
			},
			hasClass: function (cla) {
				return ctn.hasClass(cla);
			},
			required: function () {
				return !!~rules.indexOf('required');
			}
		};
		return self;
	});
	
})(jQuery, window, document, window.moment);

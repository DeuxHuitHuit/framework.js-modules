/**
 * @author Deux Huit Huit
 *
 * Form Field
 *
 */
(function ($, w, doc, undefined) {

	'use strict';
	
	var defaults = {
		container: '.js-form-field',
		input: '.js-form-input',
		error: '.js-form-error',
		label: '.js-form-label',
		states: '.js-form-state',
		clear: '.js-form-clear',
		progress: '.js-form-progress',
		validationEvents: 'blur',
		emptinessEvents: 'blur keyup',
		rules: {
			required: {
				presence: true
			},
			email: {
				email: true
			}
		}
	};
	
	App.components.exports('form-field', function _formField(options) {
		var ctn;
		var input;
		var error;
		var label;
		var states;
		var clear;
		var progress;
		var rules = [];
		var self;

		options = $.extend(true, {}, options, defaults);

		var getStateClasses = function (t) {
			return {
				error: t.attr('data-error-class'),
				valid: t.attr('data-valid-class'),
				empty: t.attr('data-empty-class'),
				notEmpty: t.attr('data-not-empty-class')
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
		
		// jshint maxstatements:40
		var validate = function () {
			var constraints = {};
			_.each(rules, function (rule) {
				if (options.rules[rule]) {
					constraints = $.extend(constraints, options.rules[rule]);
				}
			});
			
			var result = true;
			
			//Check type
			if (input.attr('type') == 'checkbox') {
				result = w.validate.single(input.prop('checked') ? 'true' : '', constraints);
			} else if (input.attr('type') == 'radio') {
				//Get grouped item
				var goodInput = input.closest('form').find('input[type=\'radio\'][name=\'' + input.attr('name') +'\']:checked');
				if (goodInput.length) {
					result = w.validate.single(goodInput.prop('checked') ? 'true' : '', constraints);
				} else {
					result = w.validate.single(input.prop('checked') ? 'true' : '', constraints);
				}
			} else {
				var value = input.val();
				result = w.validate.single(value, constraints);
			}
			
			var errorFx = !result ? 'removeClass' : 'addClass';
			var validFx = !result ? 'addClass' : 'removeClass';
			var errorMessages = !result ? '' : result.join('<br />');
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
			var value = input.val();
			var valueIsEmpty = w.validate.isEmpty(value);
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

		var onInputFocus = function () {
			label.addClass(getStateClasses(label).notEmpty);
		};
		
		var init = function (o) {
			options = $.extend(options, o);
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

			input.on('focus', onInputFocus);
		};
		
		self = {
			init: init,
			validate: validate,
			enable: enable,
			focus: focus,
			reset: reset,
			checkEmptiness: checkEmptiness
		};
		return self;
	});
	
})(jQuery, window, document);

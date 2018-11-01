(function ($) {

	'use strict';
	
	var checkActiveAndErrorState = function (data) {
		var field = data.field;
		var fieldCtn = field.getCtn();
		
		if (fieldCtn.hasClass('js-input-radio')) {
			fieldCtn = fieldCtn.add(fieldCtn.closest('.js-radio-list'));
		}

		window.updateState(fieldCtn, !!field.value(), 'active');
		window.updateState(fieldCtn, !field.isValid(), 'error');
	};

	var onInputFocus = function (key, data) {
		var field = data.field;
		var fieldCtn = field.getCtn();

		window.updateState(fieldCtn, true, 'active');
	};

	var onInputBlur = function (key, data) {
		checkActiveAndErrorState(data);
	};

	var onInputChange = function (key, data) {
		checkActiveAndErrorState(data);
		
		if (!!data.form.isValid()) {
			App.mediator.notify('formDyn.isValid', {
				form: data.form,
				ctn: data.ctn
			});
		}
	};

	var onReset = function (key, data) {
		var form = data.form;

		form.eachFields(function (field) {
			window.updateState(field.getCtn(), false, 'active');
			window.updateState(field.getCtn(), false, 'error');
		});
	};

	var onValidationError = function (key, data) {
		var form = data.form;

		form.eachFields(function (field) {
			window.updateState(field.getCtn(), false, 'error');
		});

		$.each(data.results, function (index, element) {
			if (!!element && !!element.field) {
				window.updateState(element.field.getCtn(), true, 'active');
			}
		});
	};

	var actions = function () {
		return {
			formDyn: {
				inputFocus: onInputFocus,
				inputBlur: onInputBlur,
				inputChange: onInputChange,
				reset: onReset,
				validationError: onValidationError
			}
		};
	};

	App.modules.exports('form-dyn-input-states', {
		actions: actions
	});

})(jQuery);

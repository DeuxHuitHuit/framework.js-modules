(function ($) {

	'use strict';

	var onSubmitting = function (key, data) {
		window.updateState(data.ctn, true, 'loading');
	};

	var onComplete = function (key, data) {
		window.updateState(data.ctn, false, 'loading');
		window.updateState(data.ctn, true, 'completed');
	};
	
	var onReset = function (ket, data) {
		window.updateState(data.ctn, false, 'loading');
		window.updateState(data.ctn, false, 'completed');
	};

	var actions = function () {
		return {
			formDyn: {
				submitting: onSubmitting,
				complete: onComplete,
				reset: onReset
			}
		};
	};

	App.modules.exports('form-dyn-loading', {
		actions: actions
	});

})(jQuery);

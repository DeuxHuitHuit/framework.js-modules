/**
 *  @author Deux Huit Huit
 *
 *  Site Error
 */
(function ($, global, undefined) {
	'use strict';

	var oldOnError = global.onerror;
	
	var errorHandler = function (errorMsg, url, lineNumber, column, errorObj) {
		errorMsg = errorMsg || '';
		if (!!url) {
			errorMsg += ' ' + url;
		}
		if (!!lineNumber) {
			errorMsg += ' line ' + lineNumber;
		}
		if (!!column) {
			errorMsg += ' col ' + column;
		}
		if (!!errorObj && !!errorObj.stack) {
			errorMsg += ' col ' + errorObj.stack;
		}
		// Log via Google Analytics
		App.fx.notify('tracking.sendEvent', {
			cat: 'error',
			action: errorMsg
		});
		// Call default
		return App.callback(oldOnError, errorMsg, url, lineNumber, column, errorObj);
	};

	// Trap js errors
	global.onerror = errorHandler;
	
	// Trap js errors
	$(document).ajaxError(function (e, request, settings) {
		App.fx.notify('tracking.sendEvent', {
			cat: 'error ajax',
			action: settings.url,
			label: request.statusText + ' - ' + request.status + ' - ' +
				(request.responseText || request.responseXML),
			value: request.status
		});
	});

})(jQuery, window);

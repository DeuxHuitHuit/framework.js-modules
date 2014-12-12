/**
 * @author Deux Huit Huit
 * 
 * Module Site Error
 */
(function ($, global, undefined) {
	'use strict';

	var oldOnError = global.onerror;

	global.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
		errorMsg += ' ' + url;
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
		$.sendEvent('error', errorMsg);
		// Call default
		return App.callback(oldOnError, errorMsg, url, lineNumber, column, errorObj);
	};

})(jQuery, window);

/**
 * @author Deux Huit Huit
 *
 * Local storage wrapper
 */

(function ($, global) {
	'use strict';

	var setValue = function (key, val) {
		try {
			window.localStorage[key] = '' + val;
		} catch (ex) {
			App.log(ex);
		}
	};

	var getValue = function (key) {
		try {
			return window.localStorage[key];
		} catch (ex) {
			App.log(ex);
			return null;
		}
	};

	var putValue = function (key, val) {
		try {
			var value = getValue(key);
			if (!value) {
				value = '' + val;
			} else {
				value += ' ' + val;
			}
			if (!!val) {
				setValue(key, value);
			}
		} catch (ex) {
			App.log(ex);
		}
	};

	var putValueAsync = function (key, val) {
		setTimeout(function _putValueAsync() {
			putValue(key, val);
		}, 16);
	};

	global.storage = {
		val: function (key, val) {
			if (!!val) {
				setValue(key, val);
			}
			return getValue(key);
		},
		put: putValue,
		async: {
			put: putValueAsync
		}
	};

})(jQuery, App);
/**
 * @author Deux Huit Huit
 *
 * css3 generators
 *
 * Makes the use of CSS3 in javascript more easier
 */

(function ($, global, undefined) {
	
	'use strict';
	
	/* jshint ignore:start */
	// @from https://github.com/DeuxHuitHuit/jQuery-Animate-Enhanced/blob/master/scripts/src/jquery.animate-enhanced.js
	/* jshint ignore:end */
	
	var HAS_3D = ('WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix());
	
	var intValue = function (p) {
		return ~~(!p || $.isNumeric(p) ? (p || 0) : p);
	};
	
	var pixelValue = function (p) {
		return !p || $.isNumeric(p) ? ~~(p || 0) + 'px' : p;
	};
	
	var getTranslation = function (x, y, z) {
		x = pixelValue(x);
		y = pixelValue(y);
		z = pixelValue(z);
		
		var prefix = (HAS_3D ? '3d(' : '(');
		var suffix = (HAS_3D ? ',' + z + ')' : ')');
		
		return 'translate' + prefix + x + ',' + y + suffix;
	};
	
	var getRotation = function (x, y, z, theta) {
		x = intValue(x);
		y = intValue(y);
		z = intValue(z);
		theta = !theta || $.isNumeric(theta) ? (theta || 0) + 'deg' : theta;
		
		var prefix = (HAS_3D ? '3d(' + x + ',' + y + ',' + z + ',' : 'Z(');
		var suffix = (HAS_3D ? ')' : ')');
		
		return 'rotate' + prefix + theta + suffix;
	};
	
	var getSkew = function (x, y, unit) {
		if (!unit) {
			unit = 'deg';
		}

		if (unit !== 'deg' && unit !== 'rad' && unit !== 'turn') {
			App.log('css3-generator.getSkew allow only deg, rad and turn unit');
			return null;
		} else {
			x = parseFloat(x);
			y = parseFloat(y);
		}
		
		if (x !== 0 && y !== 0) {
			return 'skew(' + x + unit + ',' + y + unit + ')';
		} else if (y !== 0) {
			return 'skewY(' + y + unit + ')';
		} else {
			return 'skewX(' + x + unit + ')';
		}
	};

	global.CSS3 = {
		translate: getTranslation,
		rotate: getRotation,
		skew: getSkew,
		prefix: function (key, value) {
			var c = {};
			if (value !== null) {
				c[key] = value;
				c['-webkit-' + key] = value;
				c['-moz-' + key] = value;
				c['-ms-' + key] = value;
				c['-o-' + key] = value;
			}
			return c;
		}
	};
	
})(jQuery, window);

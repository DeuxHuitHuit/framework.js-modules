/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Page loading handling
 */
(function ($, undefined) {

	'use strict';
	
	var INITIAL_VALUE = 0.02; // 2%
	var INCREMENT = 0.05; // 5%
	var CLOSE_DELAY = 700; // ms
	
	var LOADING = 'page-loading';
	var SHOW = 'show';
	var START = 'start';
	
	var html = $();
	var holder = $();
	
	var isStarted = false;
	
	var closeTimer = 0;
	var currentValue = 0;
	
	var p = function (i) {
		return (i * 100) + '%';
	};
	
	var start = function () {
		clearTimeout(closeTimer);
		
		currentValue = INITIAL_VALUE;

		holder
			.removeClass(START)
			.width(p(currentValue))
			.height();
		holder
			.addClass(START)
			.addClass(SHOW);
		
		html.addClass(LOADING);
		
		isStarted = true;
		
		App.log({args: 'Start', me: 'page-load'});
	};
	
	var end = function () {
		holder
			.width('100%');
		
		closeTimer = setTimeout(function () {
			holder.removeClass(SHOW);
			html.removeClass(LOADING);
			isStarted = false;
		}, CLOSE_DELAY);
		
		App.log({args: 'End', me: 'page-load'});
	};
	
	var progress = function (percent) {
		if (isStarted) {
			var incVal = currentValue + INCREMENT;
			currentValue = Math.max(incVal, percent);
			currentValue = Math.min(currentValue, 1);
			holder.width(p(currentValue));
		}
		App.log({args: ['Progress %s', percent], me: 'page-load'});
	};
	
	var loadprogress = function (key, data) {
		progress(data.percent);
	};
	
	var actions = function () {
		return {
			pageLoad: {
				start: start,
				progress: progress,
				end: end
			},
			pages: {
				loading: start,
				loadfatalerror: end,
				loadprogress: loadprogress,
				loaded: end,
				notfound: end
			}
		};
	};
	
	var init = function () {
		html = $('html');
		holder = $('#load-progress');
	};
	
	var PageLoad = App.modules.exports('page-load', {
		init: init,
		actions : actions
	});
	
})(jQuery);
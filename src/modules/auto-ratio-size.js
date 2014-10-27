/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site;
	var sitePages;
	
	var getPage = function () {
		return $('> .page:visible', sitePages);
	};
	
	var defaultCallback = function () {
		App.mediator.notifyCurrentPage('autoRatio.resizeCompleted');
	};
	
	var onResize = function () {
		updateElements($('*[data-auto-ratio]', getPage()), defaultCallback);
	};
	
	var updateElements = function (elements, callback) {
		elements.each(function () {
			var t = $(this);
			var r = t.attr('data-auto-ratio');
			var fx = t.attr('data-auto-ratio-property') || 'height';
			var val;
			
			if(fx == 'width' || fx == 'max-width') {
				val = t.height();
			} else {
				val = t.width();
			}
			
			t.css(fx, Math.round(val / r));
			
			$('img[data-src-format]', t).jitImage();
		});
		
		App.callback(callback);
	};
	
	var onPageEnter = function () {
		onResize();
	};
	
	var update = function (key, data) {
		if (data && data.elements) {
			updateElements(
				data.elements, 
				(data.callback ? data.callback : defaultCallback)
			);
		} else {
			onResize();
		}
	};
	
	var init = function () {
		site = $('#site');
		sitePages = $('#site-pages', site);
		onResize();
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: onPageEnter
			},
			autoRatioSize: {
				update: update
			},
			articleChanger: {
				enter: onPageEnter
			}
		};
	};
	
	App.modules.exports('auto-ratio-size', {
		init: init,
		actions: actions
	});
	
})(jQuery);

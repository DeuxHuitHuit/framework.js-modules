/**
 *  @author Deux Huit Huit
 *
 *  Auto scroll to id
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var scrollToIdClicked = function (e) {
		
		//Scroll To hash
		var t = $(this);
		var href = t.attr('href');
		var h = href.split('#')[1];
		var scrollCtn = null;
		var html = $('html');
		
		var offsetSelector = t.attr('data-scroll-to-id-offset-selector');
		var offset = 0;
		var scrollCtnAttr = t.attr('data-scroll-to-id-scroll-ctn');
		
		if (!!scrollCtnAttr) {
			scrollCtn = t.closest('.page').find(scrollCtnAttr);
		}
		
		if (!!offsetSelector) {
			$(offsetSelector).each(function (i, e) {
				offset -= $(e).height();
			});
		}
		
		var target = site.find('#' + h);
		
		if (!!target.length) {
			offset += target.offset().top;
			html.velocity('scroll', {
				offset: offset + 'px',
				mobileHA: false,
				container: scrollCtn
			});
			t.sendClickEvent({
				cat: t.attr('data-ga-cat') || 'Scroll to ' + h,
				event: e
			});
			return window.pd(e);
		}
	};
	
	var init = function () {
		site.on(App.device.events.click, '.js-scroll-to-id-button', scrollToIdClicked);
	};
	
	App.modules.exports('auto-scroll-to-id', {
		init: init
	});
	
})(jQuery);

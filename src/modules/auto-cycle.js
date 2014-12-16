/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	
	var pageEnter = function (key, data) {
		//var p = $(data.page.key());
		
		$('.js-cycle:not(.cycle-inited)').each(function () {
			var t = $(this);
			
			if (!t.data('cycle-disable-mobile') || !$.mobile) {
				var o = {
					slides: t.attr('data-cycle-slides') || '>img',
					pager: t.attr('data-cycle-pager') || '> .cycle-pager',
					next: t.attr('data-cycle-next') || '> .cycle-next',
					prev: t.attr('data-cycle-prev') || '> .cycle-prev',
					timeout: t.attr('data-cycle-timeout') || 4000,
					paused: t.attr('data-cycle-paused') || false,
					pauseOnHover: t.attr('data-cycle-pause-on-hover') || false,
					fx: t.attr('data-cycle-fx') || 'fade',
					captionTemplate: t.attr('data-cycle-caption-template') || '',
					log: App.debug()
				};
				
				t.cycle(o);
				
				t.addClass('cycle-inited');
			}
		});
	};
	
	var init = function () {
		
	};
	
	var actions = function () {
		return { 
			/*site: {
				resize: onResize
			},*/
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			}
		};
	};

	App.modules.exports('auto-cycle',  { 
		init: init,
		actions: actions
	});
	
})(jQuery);

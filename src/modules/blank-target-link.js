/**
 * @author Deux Huit Huit
 * 
 * Blank link targets
 *
 * Listens to
 * 
 * - 
 *
 */
(function ($, undefined) {
	
	"use strict";
	
	/**
	 * @author Deux Huit Huit
	 * 
	 * Link target : Add target blank to all outside link
	 */
	$.fn.extend({
		blankLink: function () {
			/* link target */
			$(this).each(function _eachTarget () {
				var t = $(this);
				var href = t.attr('href');
				
				if (!!href && (/^https?:\/\//.test(href) || /^\/workspace/.test(href) )) {
					if (t.attr('target') != '_blank') {
						// must not be in
						if (! /^:\/\//.test(href)) {
							//set target
							t.attr('target', '_blank');
						}
					}
				}
			});
			
		}
	});
	
	
	var onPageEnter = function (key,data,e) {
		$('a',$(data.page.key())).blankLink();
	};
	
	var init = function () {
		
	};
	
	var actions = {
		page: {
			enter : onPageEnter
		}
	};
	
	var BlankLinkModule = App.modules.exports('blankLinkModule', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);
/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	"use strict";
	var 
	
	win = $(window),
	
	resizeHandler = function(e) {
		App.mediator.notify('site.resize', null, e);
	},
	
	scrollHandler = function (e) {
		App.mediator.notify('site.scroll', null, e);
	},
	
	init = function () {
		//Trigger resize
		win.resize(resizeHandler).scroll(scrollHandler);
	},
	
	Links = App.modules.exports('windowNotifier', {
		init: init
	});
	
})(jQuery);

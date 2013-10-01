/**
 * @author Deux Huit Huit
 *
 * Share This
 * 
 */
(function ($, undefined) {
	
	"use strict";
	
	var win = $(window);
	var site = $('#site');
	
	var onApplyButton = function(key, options, e) {
		
		var defaultShareThisOption = {
			service: "sharethis",
			title: document.title,
			url: document.location.protocol + '//' + document.location.host + document.location.pathname,
			type: "large"
		};
		
		var o = $.extend(defaultShareThisOption, options);
		
		if (!!o.element && !!window.stWidget) {
			//init share this if we found
			window.stWidget.addEntry(o);
		}
	};
	
	
	var init = function () {
		
	};
	
	var actions = {
		shareThis : {
			applyButton : onApplyButton
		}
	};
	
	var Menu = App.modules.exports('shareThis', {
		init: init,
		actions : function(){
			return actions;
		}
	});
	
})(jQuery);

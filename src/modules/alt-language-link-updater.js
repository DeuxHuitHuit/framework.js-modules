/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';
	var linkSelector = '#site a.js-alt-lg-link';
	var win = $(window);
	var linkList = {};
	
	var init = function () {
		
		//Create initial value
		var data = {};
		$('link[rel=alternate][hreflang]', document).each(function () {
			var t = $(this);
			data[t.attr('hreflang')] = t.attr('href');
		});
	
		linkList[document.location.pathname] = data;
	};
	
	var onPageLoaded = function (key, data, e) {
		if (data.data) {
			var linkData = {};
			
			$(data.data).each(function (i, e) {
				if ($(e).is('link')) {
					var t = $(e);
					if (t.attr('hreflang')) {
						linkData[t.attr('hreflang')] = t.attr('href');
					}
				}
				if ($(e).is('body')) {
					return true;
				}
			});
			linkList[data.url] = linkData;
		}
	};
	
	var onEnter = function (key, data, e) {
		if (linkList[document.location.pathname]) {
			
			//Update links
			$(linkSelector).each(function () {
				var t = $(this);
				var value = linkList[document.location.pathname][t.data('lg')];
				
				if (value) {
					t.attr('href', value);
				}
			});
		}
	};
	
	var actions = {
		pages : {
			loaded : onPageLoaded
		},
		page : {
			enter : onEnter
		},
		articleChanger: {
			loaded: onPageLoaded,
			enter: onEnter
		}
	};
	
	var AltLanguageLinkUpdater = App.modules.exports('altLanguageLinkUpdater', {
		init: init,
		actions : function () {
			return actions;
		}
	});
	
})(jQuery);

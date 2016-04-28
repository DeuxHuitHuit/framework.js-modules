/**
 * @author Deux Huit Huit
 * 
 * Title Updater
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var metaTitle = $('title', document);
	var titleList = {};
	
	
	var init = function () {
		titleList[document.location.pathname] = $('title').text();
	};
	
	var onPageLoaded = function (key, data, e) {
		if (data.data) {
			var title = '';
			$(data.data).each(function (i, e) {  
				if ($(e).is('title')) {
					title = $(e).text();
					return true;
				}
			});
			if (!!!data.url) {
				data.url = document.location.pathname;
			}
			titleList[data.url] = title;
		}
	};
	
	var onEnter = function (key, data, e) {
		if (titleList[document.location.pathname]) {
			document.title = titleList[document.location.pathname];
		}
	};
	
	var actions = {
		pages : {
			loaded : onPageLoaded,
			internal : {
				loaded : onPageLoaded
			}
		},
		page : {
			enter : onEnter,
			internal : {
				enter : onEnter
			}
		},
		articleChanger: {
			loaded: onPageLoaded,
			enter: onEnter
		}
	};
	
	var TitleUpdater = App.modules.exports('titleUpdater', {
		init: init,
		actions : function () {
			return actions;
		}
	});
	
})(jQuery);

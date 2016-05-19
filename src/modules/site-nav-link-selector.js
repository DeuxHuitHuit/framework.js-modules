/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var siteNav = $('.js-site-nav');
	
	var updateSelectedLink = function (newKey) {
		var newBtn = $('.js-nav-link-button.btn-' + newKey, siteNav);
		$('.js-nav-link-button', siteNav).removeClass('is-selected');
		newBtn.addClass('is-selected');
	};
	
	var onEntering = function (key, data) {
		//check page
		var newPage = $(data.page.key());
		updateSelectedLink(data.page.key().substring(1));
	};
		
	var init = function () {
		
	};
	
	var actions = function () {
		return {
			page: {
				entering: onEntering
			}
		};
	};
	
	var SiteHeader = App.modules.exports('site-header-link-selector', {
		init: init,
		actions: actions
	});
	
})(jQuery);

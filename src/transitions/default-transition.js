/**
 * @author Deux Huit Huit
 * 
 * Default page transition
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var body = $('body');
	var sitePages = $('#site-pages');
	
	var DEFAULT_DELAY = 350;
	
	var defaultTransition = function (data, callback) {
		
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		var enterPageAnimation = function () {
		
			//Notify intering page
			App.modules.notify('page.entering', {page: enteringPage, route: data.route});
			
			//Animate leaving and start entering after leaving animation
			//Need a delay for get all Loaded
			domEnteringPage.ready(function () {
				domEnteringPage.css({opacity: 1, display: 'block'});
				body.addClass(enteringPage.key().substring(1));
				sitePages.animate({opacity: 1}, DEFAULT_DELAY, function () {
					App.modules.notify('transition.end', {page: enteringPage, route: data.route});
				});
				enteringPage.enter(data.enterNext);
				App.callback(callback);
			});
		};
		
		var afterScroll = function () {
			sitePages.animate({opacity: 0}, DEFAULT_DELAY, function () {
				//notify all module from leaving
				body.removeClass(leavingPage.key().substring(1));
				App.modules.notify('page.leaving', {page: leavingPage});
				
				if ($.mobile) {
					win.scrollTop(0);
				}
				
				//Leave the current page
				leavingPage.leave(data.leaveCurrent);
			
				domLeavingPage.hide();
				enterPageAnimation();
			});
		};
		
		if ($.mobile) {
			afterScroll();
		} else {
			$.scrollTo(0, {
				duration : Math.min(1200, $(window).scrollTop()),
				easing : 'easeInOutQuad',
				onAfter : afterScroll
			});
		}
	};
	
	App.transitions.exports({
		transition: defaultTransition,
		canAnimate: function (data) {
			return true;
		}
	});
	
})(jQuery);

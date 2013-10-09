/**
 * @author Deux Huit Huit
 * 
 * Default page transition
 *
 */
(function ($, undefined) {
	
	"use strict";
	
	var win = $(window);
	var body = $('body');
	var sitePages = $('#site-pages');
	
	var defaultTransition = function(data,callback) {
		
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		var enterPageAnimation = function () {
		
			//Notify intering page
			App.modules.notify('page.entering', {page: enteringPage, route: data.route});
			
			//Animate leaving and start entering after leaving animation
			//Need a delay for get all Loaded
			domEnteringPage.ready(function() {
				domEnteringPage.css({opacity: 1, display : 'block'});
				body.addClass(enteringPage.key().substring(1));
				sitePages.animate({opacity: 1},500);
				enteringPage.enter(data.enterNext);
			});
			
		};
		
		body.removeClass(leavingPage.key().substring(1));
		
		sitePages.animate({opacity: 0},1000,function() {
			//notify all module
			App.modules.notify('page.leaving', {page: leavingPage});
			
			//Leave the current page
			leavingPage.leave(data.leaveCurrent);
		
			domLeavingPage.hide();
			enterPageAnimation();
			
		});
	};
	
	
	App.transitions.exports({
		transition: defaultTransition,
		canAnimate: function(data) {
			return true;
		}
	});
	
})(jQuery);

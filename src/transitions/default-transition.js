/**
 * @author Deux Huit Huit
 * 
 * Links modules
 * 
 * - Makes all external links added into the dom load in a new page 
 * - Makes all internal links mapped to the mediator
 *
 * Listens to
 * 
 * - pages.loaded
 *
 */
(function ($, undefined) {
	
	"use strict";
	
	var 
	win = $(window),
	body = $('body'),
	
	defaultTransition = function(data,callback) {
		
		var 
		leavingPage = data.currentPage,
		enteringPage = data.nextPage,
		
		domEnteringPage = $(enteringPage.key()),
		domLeavingPage = $(leavingPage.key()),
		
		sitePages = $('#site-pages'),
		enterPageAnimation = function() {
		
			//Notify intering page
			App.modules.notify('page.entering',{page: enteringPage, route: data.route});
			
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
			App.modules.notify('page.leaving',{page: leavingPage});
			
			//Leave the current page
			leavingPage.leave(data.leaveCurrent);
		
			domLeavingPage.hide();
			enterPageAnimation();

		});
	};
	
		
	//from Accueil to Article
	App.transitions.exports({
		transition : defaultTransition
		/*canAnimate : function(data) {
			return $(data.currentPage.key()).hasClass('page-transition-modal');
		}*/
	});
	

	
})(jQuery);

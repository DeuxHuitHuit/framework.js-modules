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
			
	var beginCompleted = false;
	var loadCompleted = false;

	var dataIn = null;
	
	var completeAnim = function (data, callback) {
		var bgTransition = $('#bg-transition', body);
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		body.addClass(enteringPage.key().substring(1));
		//Notify intering page
		App.modules.notify('page.entering', {page: enteringPage, route: data.route});
		
		//Animate leaving and start entering after leaving animation
		//Need a delay for get all Loaded
		domEnteringPage.ready(function () {
			domEnteringPage.css({opacity: 1, display: 'block'});
			enteringPage.enter(data.enterNext);
			
			bgTransition.fadeOut(DEFAULT_DELAY).promise().then(function () {
				App.modules.notify('transition.end', {page: enteringPage, route: data.route});
			});
			
			App.callback(callback);
		});
	};
	
	var defaultBeginTransition = function (data, callback) {
		var bgTransition = $('#bg-transition', body);
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		beginCompleted = false;
		loadCompleted = false;
		dataIn = null;
		bgTransition.fadeIn(DEFAULT_DELAY).promise().then(function () {
			//notify all module from leaving
			body.removeClass(leavingPage.key().substring(1));
			App.modules.notify('page.leaving', {page: leavingPage});
			
			win.scrollTop(0);
			
			//Leave the current page
			leavingPage.leave(data.leaveCurrent);
		
			domLeavingPage.hide();
			beginCompleted = true;
			
			if (loadCompleted) {
				completeAnim(dataIn);
			}
		});
	};
	
	var defaultTransition = function (data, callback) {
		loadCompleted = true;
		dataIn = data;
		if (beginCompleted) {
			completeAnim(data, callback);
		}
	};
	
	App.transitions.exports({
		beginTransition: defaultBeginTransition,
		transition: defaultTransition,
		canAnimate: function (data) {
			return true;
		}
	});
	
})(jQuery);

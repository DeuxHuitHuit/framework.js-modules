/**
 * @author Deux Huit Huit
 * 
 * Transition Modules
 *
 * Listens to
 * 
 * - 
 *
 */
(function ($, undefined) {
	
	"use strict";
	
	var 
	
	transitionList = [],
	
	defaultTransition = function(data,callback) {
			
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
			
		var enterPageAnimation = function() {
			//Notify intering page
			App.modules.notify('page.entering', {page: enteringPage, route: data.route});
			
			domEnteringPage.css({opacity: 1, display: 'block'});
			
			//Animate leaving and start entering after leaving animation
			domLeavingPage.css({display: 'none'});
			
			enteringPage.enter(data.enterNext);
			
			App.callback(callback);
		};
		
		//Default Behavior
		
		//notify all module
		App.modules.notify('page.leaving',{page: leavingPage});
		
		//Leave the current page
		leavingPage.leave(data.leaveCurrent);

		enterPageAnimation();
	},
	
	animatingTo = '',
	
	onRequestPageTransition = function(key, data,e) {
		var 
		animation = defaultTransition,
		c;
		
		for (c = 0; c < transitionList.length; c++) {
			var 
			it = transitionList[c];
			if( (it.from === data.currentPage.key().substring(1) || it.from === '*') &&	(it.to === data.nextPage.key().substring(1) || it.to === '*')) {
				if(it.canAnimate(data)) {
					animation = it.transition;
					break;
				}
			}
		}
		animatingTo = data.nextPage.key().substring(1);
		animation(data,function() {
			animatingTo = '';
		});
		
		//mark as handled
		data.isHandled = true;
	},
	
	actions = function () {
		return {
			pages: {
				requestPageTransition: onRequestPageTransition
			},
			pageTransitionAnimation : {
				getTargetPage : function(key,data,e) {
					if(!data) {
						data = {
							result : {}
						};
					}
					if(!data.result) { data.result = {};}
					data.result.pageTransitionAnimation = {};
					data.result.pageTransitionAnimation.target = animatingTo;
				}
			}
		};
	},
	
	init = function () {
		// append 
		$(App.root()).append($('<div id="bg-transition" ></div>'));
	},
	
	exportsTransition = function(options) {
		var o = $.extend({
			from : '*',
			to : '*',
			transition : defaultTransition,
			canAnimate : function() {return true;}
		},options);
		
		if (o.from === '*' && o.to === '*') {
			defaultTransition = o.transition;
		} else {
			transitionList.push(o);	
		}
	},
	
	PageTransitionAnimation = App.modules.exports('pageTransitionAnimation', {
		init: init,
		actions: actions
	});
	
	//register App.transitions
	
	/** Public Interfaces **/
	window.App = $.extend(window.App, {
		
		transitions : {
			exports : exportsTransition
		}
		
	});
	
})(jQuery);

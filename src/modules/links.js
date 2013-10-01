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
	
	onClickGoto = function (e) {
		var t = $(this),
			href = t.attr('href');
			
		if(!e.ctrlKey) {
			App.mediator.goto(href);
			return window.pd(e);
		}
	},
	
	onClickToggle = function(e) {
		var t = $(this),
			href = t.attr('href');
		
		App.mediator.toggle(href);
		
		return window.pd(e);
	},
	
	actions = function () {
		return {};
	},
	
	init = function () {
		// capture all click in #site: delegate to the link or in any ui-dialog (jquery.ui)
		$('#site').on('click', 'a[href^="/"]:not([href^="/workspace"]):not([data-action^="full"]):not([data-action^="toggle"]):not([data-action^="none"])', onClickGoto);
		
		$('#site').on('click', 'a[href^="/"][data-action^="toggle"]', onClickToggle);
	},
	
	Links = App.modules.exports('links', {
		init: init,
		actions: actions
	});
	
})(jQuery);

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
	
	'use strict';
	
	var onClickGoto = function (e) {
		var t = $(this);
		var href = t.attr('href');
		
		if (!App.mediator._currentPage()) {
			return true;
		}
			
		if (!e.ctrlKey) {
			App.mediator.goto(href);
			return window.pd(e);
		}
	};
	
	var onClickToggle = function (e) {
		var t = $(this);
		var href = t.attr('href');
		var fallback = t.attr('data-toggle-fallback-url');
		
		if (!App.mediator._currentPage()) {
			return true;
		}
		
		App.mediator.toggle(href, fallback);
		
		return window.pd(e);
	};
	
	var actions = function () {
		return {};
	};
	
	var init = function () {
		// capture all click in #site: delegate to the link or in any ui-dialog (jquery.ui)
		var sel = 'a[href^="/"]' + 
			':not([href^="/workspace"])' +
			':not([data-action^="full"])' +
			':not([data-action^="toggle"])' +
			':not([data-action^="none"])';
		$('#site').on($.click, sel, onClickGoto);
		
		$('#site').on($.click, 'a[href^="/"][data-action^="toggle"]', onClickToggle);
	};
	
	var Links = App.modules.exports('links', {
		init: init,
		actions: actions
	});
	
})(jQuery);

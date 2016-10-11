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
		
		if (!e.metaKey && !e.ctrlKey) {
			if (/^\?.+/.test(href)) {
				href = window.location.pathname + href;
			}
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
		var loc = window.location;
		var origin = loc.origin || (loc.protocol + '//' + loc.hostname);
		var workspaceExclusion = ':not([href^="/workspace"])';
		var dataAttrExclusions = ':not([data-action="full"])' +
			':not([data-action="toggle"])' +
			':not([data-action="none"])';
		var localLinks = 'a[href^="' + origin + '"]';
		var localWorkspaceExclusion = ':not(a[href^="' + origin + '/workspace"])';
		var toggleLinks = '[data-action="toggle"]';
		var absoluteLinks = 'a[href^="/"]';
		var queryStringLinks = 'a[href^="?"]';

		// capture all click in #site
		$('#site')
			.on($.click, absoluteLinks + workspaceExclusion + dataAttrExclusions, onClickGoto)
			.on($.click, queryStringLinks + workspaceExclusion + dataAttrExclusions, onClickGoto)
			.on($.click, localLinks + dataAttrExclusions + localWorkspaceExclusion, onClickGoto)
			.on($.click, absoluteLinks + toggleLinks, onClickToggle)
			.on($.click, queryStringLinks + toggleLinks, onClickToggle);
	};
	
	var Links = App.modules.exports('links', {
		init: init,
		actions: actions
	});
	
})(jQuery);

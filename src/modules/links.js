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
	var loc = window.location;
	var origin = loc.origin || (loc.protocol + '//' + loc.hostname);
	var originRegExp = new RegExp('^' + origin, 'i');
	
	var onClickGoto = function (e) {
		var t = $(this);
		var href = t.attr('href');
		
		// ignore click since there are no current page
		if (!App.mediator._currentPage()) {
			return true;
		}
		
		// ignore click since it's not http
		if (/^(mailto|skype|tel|ftps?|#)/im.test(href)) {
			return true;
		}
		
		// no keys on the keyboard
		if (!e.metaKey && !e.ctrlKey) {
			if (/^\?.+/.test(href)) {
				href = window.location.pathname + href;
			}
			if (originRegExp.test(href)) {
				href = href.replace(originRegExp, '');
			}
			
			App.mediator.notify('links.gotoClicked', {
				item: t, url: href
			});
			
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
		
		App.mediator.notify('links.toggleClicked', {
			item: t,
			url: href,
			fallback: fallback
		});
		
		App.mediator.toggle(href, fallback);
		
		return window.pd(e);
	};
	
	var actions = function () {
		return {};
	};
	
	var init = function () {
		var workspaceExclusion = ':not([href^="/workspace"])';
		var dataAttrExclusions = ':not([data-action="full"])' +
			':not([data-action="toggle"])' +
			':not([data-action="none"])';
		var localLinks = 'a[href^="' + origin + '"]';
		var localWorkspaceExclusion = ':not(a[href^="' + origin + '/workspace"])';
		var toggleLinks = '[data-action="toggle"]';
		var absoluteLinks = 'a[href^="/"]';
		var queryStringLinks = 'a[href^="?"]';
		var click = App.device.events.click;

		// capture all click in #site
		$('#site')
			.on(click, absoluteLinks + workspaceExclusion + dataAttrExclusions, onClickGoto)
			.on(click, queryStringLinks + workspaceExclusion + dataAttrExclusions, onClickGoto)
			.on(click, localLinks + dataAttrExclusions + localWorkspaceExclusion, onClickGoto)
			.on(click, absoluteLinks + toggleLinks, onClickToggle)
			.on(click, queryStringLinks + toggleLinks, onClickToggle);
	};
	
	var Links = App.modules.exports('links', {
		init: init,
		actions: actions
	});
	
})(jQuery);

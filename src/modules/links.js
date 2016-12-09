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
	
	var mustIgnore = function (t, e) {
		// ignore click since there are no current page
		if (!App.mediator._currentPage()) {
			return true;
		}
		
		// ignore click since it's not http
		var href = t.attr('href');
		if (/^(mailto|skype|tel|ftps?|#)/im.test(href)) {
			return true;
		}
		
		// no keys on the keyboard
		if (!!e.metaKey || !!e.ctrlKey) {
			return true;
		}
		return false;
	};
	
	var onClickGoto = function (e) {
		var t = $(this);
		var href = t.attr('href');
		
		if (mustIgnore(t, e)) {
			return true;
		}
		
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
	};
	
	var onClickToggle = function (e) {
		var t = $(this);
		var href = t.attr('href');
		var fallback = t.attr('data-toggle-fallback-url');
		
		if (mustIgnore(t, e)) {
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
	
	var onClickCancel = function (e) {
		var t = $(this);
		if (mustIgnore(t, e)) {
			return true;
		}
		return window.pd(e);
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
		var pick = App.device.events.pick;
		var click = App.device.events.click;

		// capture all click in #site
		$('#site')
			.on(pick, absoluteLinks + workspaceExclusion + dataAttrExclusions, onClickGoto)
			.on(pick, queryStringLinks + workspaceExclusion + dataAttrExclusions, onClickGoto)
			.on(pick, localLinks + dataAttrExclusions + localWorkspaceExclusion, onClickGoto)
			.on(pick, absoluteLinks + toggleLinks, onClickToggle)
			.on(pick, queryStringLinks + toggleLinks, onClickToggle)
			.on(click, absoluteLinks + workspaceExclusion + dataAttrExclusions, onClickCancel)
			.on(click, queryStringLinks + workspaceExclusion + dataAttrExclusions, onClickCancel)
			.on(click, localLinks + dataAttrExclusions + localWorkspaceExclusion, onClickCancel)
			.on(click, absoluteLinks + toggleLinks, onClickCancel)
			.on(click, queryStringLinks + toggleLinks, onClickCancel);
	};
	
	var Links = App.modules.exports('links', {
		init: init
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * Url Changer
 *
 */

(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var currentPageKey = '';
	var currentPageRoute = '';
	var currentPageUrl = '';
	var currentPageFragment = '';
	var currentQsFragment = {};
	var isPopingState = false;
	var triggerFirstFragmentChange = false;

	var langs = ['fr', 'en'];

	var getLanguageIndex = function () {
		var body = $('body');
		var index = 0;
		$.each(langs, function (i, l) {
			if (body.hasClass(l)) {
				index = i;
				return false;
			}
		});
		return index;
	};

	var extractQS = function () {
		var QSIndex = currentPageFragment.indexOf('?');
		if (QSIndex > -1) {
			currentQsFragment = window.QueryStringParser.parse(
				currentPageFragment.substring(QSIndex)
			);
		} else {
			currentQsFragment = {};
		}
	};

	var updateUrlFragment = function () {
		history.pushState({}, document.title, currentPageRoute + currentPageFragment);
	};
	
	var getNextRouteFromData = function (data) {
		return data.page.routes()[getLanguageIndex()];
	};
	
	var extractFragmentFromRoute = function (nextRoute, reelRoute) {
		var	starIndex = !nextRoute ? -1 : nextRoute.indexOf('*');
		var processStar = function () {
			nextRoute = nextRoute.substring(0, starIndex);
			
			//We got some fragment also
			if (reelRoute.length > nextRoute.length) {
				currentPageFragment = reelRoute.substring(starIndex);
				extractQS();
			} else {
				//Clear fragment?
				currentPageFragment = '';
				currentQsFragment = {};
			}
		};

		var processNoStar = function () {
			//Keep Search and Hash has a fragment if we have a # or ? after the
			if (reelRoute.length > nextRoute.length) {
				var charAfter = reelRoute[nextRoute.length];
				
				if (charAfter === '#' || charAfter === '?') {
					currentPageFragment = reelRoute.substring(nextRoute.length);
					extractQS();
				}
			} else {
				//Clear fragment?
				currentPageFragment = '';
				currentQsFragment = {};
			}
		};

		if (starIndex > -1) {
			processStar();
		} else {
			processNoStar();
		}
		return nextRoute;
	};
	
	var pageEntering = function (newRoute) {
		var url = newRoute;
		
		if (currentPageRoute === '') {
			triggerFirstFragmentChange = true;
		}
		if (currentPageRoute !== '') {
			url = url + currentPageFragment;
		
			if (!isPopingState) {
				history.pushState({}, document.title, newRoute + currentPageFragment);
			}
			isPopingState = false;
		}
	};

	var onPageEntering = function (key, data, e) {
		var nextRoute = extractFragmentFromRoute(getNextRouteFromData(data), data.route);
		
		//Update browser url if we change page route
		if (currentPageRoute != nextRoute) {
			//Keep a copy of the currentPage url
			pageEntering(nextRoute);

			currentPageRoute = nextRoute;
			currentPageUrl = data.route;
			currentPageKey = data.page.key();
			
			$.sendPageView({page: data.route});
		}
	};
	
	var onPageEntered = function (key, data, e) {
		if (triggerFirstFragmentChange) {
			//Detect if we have a fragment
			var href = window.location.href;
			var curPageHref = window.location.protocol + '//' +
				window.location.host + currentPageRoute;
			currentPageFragment = href.substring(curPageHref.length);
			App.mediator.notify('page.fragmentChanged', currentPageFragment);
		}
	};
	
	var onPageLeaving = function (key, data, e) {
		//clear the current page fragment
		currentPageFragment = '';
		//Keep QS sync
		extractQS();
	};
	
	var onUpdateUrlFragment = function (key, data, e) {
		// Don't do it if we don't have any page url
		if (!!currentPageRoute) {
			//Keep a copy of the fragment
			currentPageFragment = data;
			if ($.isPlainObject(data)) {
				//Keep QS sync
				extractQS();
			}
			updateUrlFragment();
			$.sendPageView({page: data.route});
		}
	};
	
	var generateQsString = function () {
		var result = '';
		
		$.each(currentQsFragment, function (prop, value) {
			if (!!value) {
				if (!!result.length) {
					result += '&';
				}
				result += (prop + '=' + value);
			}
		});
		
		return result;
	};
	
	var onUpdateQsFragment = function (key, options, e) {
		if ($.isPlainObject(options.qs)) {
			var oldQsFragmentString = window.QueryStringParser.stringify(_currentQsFragment);

			//Update currentQsFragment
			$.extend(currentQsFragment, options.qs);
			
			var currentUrlWithoutHash = _currentPageFragment.split('#')[0];
			var currentHash = _currentPageFragment.split('#')[1];

			var currentQsIndex = currentPageFragment.indexOf('?'),
			newQsString = generateQsString();
			
			if (('?' + newQsString) !== oldQsFragmentString) {
				//Generate new page fragment
				if (!newQsString.length) {

					//Trim all existing qs
					if (currentQsIndex !== -1) {
						_currentPageFragment = currentUrlWithoutHash.split('?')[0];
					}
				} else if (currentQsIndex === -1) {
					_currentPageFragment = currentUrlWithoutHash + '?' + newQsString;

				} else {
					currentPageFragment = currentUrlWithoutHash.substring(0, currentQsIndex + 1) +
						newQsString;
				}

				//Append back hash value
				if (currentHash.length) {
					_currentPageFragment += '#' + currentHash;
				}

				//_currentPage
				updateUrlFragment();

				if (options.raiseFragmentChanged) {
					App.mediator.notify('page.fragmentChanged', currentPageFragment);
				}
			}
		}
	};
	
	var urlChanged = function () {
		var nextPage = App.pages.page(window.location.pathname);
		
		//if we found a page for this route
		if (nextPage) {
			var loc = window.location;
			//Detect if we change page
			if (nextPage.key() == currentPageKey) {
				if (!loc.origin) {
					// IE !!
					loc.origin = loc.protocol + '//' + loc.hostname;
				}
				var cur = loc.origin + currentPageRoute;
				var pageFragment = loc.href.substring(cur.length);
				
				if (currentPageFragment != pageFragment) {
					App.mediator.notify('page.fragmentChanged', pageFragment);
					currentPageFragment = pageFragment;
					//Sync Qs
					extractQS();
				} else {
					App.mediator.notify('page.sameFragmentRequested', pageFragment);
				}
			} else {
				isPopingState = true;
				App.mediator.goto(loc.pathname + loc.search, currentPageUrl);
			}
		} else {
			App.log({args: 'Page not found', me: 'Url Changer'});
		}
	};

	var onNavigateToCurrent = function (key, data, e) {
		var oldFragment = currentPageFragment;
		
		extractFragmentFromRoute(getNextRouteFromData(data), data.route);
		updateUrlFragment();
		
		//Set back old fragment to trigger fragment changed
		currentPageFragment = oldFragment;
		urlChanged();
		$.sendPageView({page: data.route});
	};
	
	var getCurrentUrl = function () {
		return window.location.pathname;
	};
	
	var getQueryString = function () {
		return window.location.search;
	};

	var getFullUrl = function () {
		return window.location.toString();
	};
	
	var init = function () {
		//Detect good strategy
		if (window.history.pushState) {
			win.on('popstate', urlChanged);
		} else {
			App.log({
				fx: 'error',
				msg: 'Cannot update url : history api was not found'
			});
		}
	};
	
	var actions = function () {
		return {
			page: {
				entering: onPageEntering,
				leaving: onPageLeaving,
				enter: onPageEntered,
				updateUrlFragment: onUpdateUrlFragment,
				updateQsFragment: onUpdateQsFragment
			},
			pages: {
				navigateToCurrent : onNavigateToCurrent
			},
			url: {
				getUrl: getCurrentUrl,
				getQueryString: getQueryString,
				getFullUrl: getFullUrl
			}
		};
	};
	
	var urlChanger = App.modules.exports('urlChanger', {
		init: init,
		actions : actions
	});
	
})(jQuery);

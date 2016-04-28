/**
 * @author Deux Huit Huit
 *
 * Url Changer
 *
 */

(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var _currentPageKey = '';
	var _currentPageRoute = '';
	var _currentPageUrl = '';
	var _currentPageFragment = '';
	var _currentQsFragment = {};
	
	var createHashStrategy = function () {
		var _initialDocumentUrl = window.location.pathname;
		var _isInternalFragChange = false;
		var _triggerFirstHashChange = false;
		
		return {
			urlChanged : function () {
				if (!_isInternalFragChange) {
					var h = window.location.hash;
					var loc = h.length > 1 ? 
							h.substring(1) : 
							window.location.pathname + window.location.search;
					
					var	nextPage = App.pages.page(loc);

					//if we found a page for this route
					if (nextPage) {
						
						//Detect if we change page
						if (nextPage.key() == _currentPageKey) {
							var _cur = _currentPageRoute;
							var pageFragment = loc.substring(_cur.length);
							
							if (_currentPageFragment != pageFragment || _triggerFirstHashChange) {
								App.mediator.notify('page.fragmentChanged', pageFragment);
								_currentPageFragment = pageFragment;
							}
						} else {
							App.mediator.goto(loc);
						}
					} else {
						App.log({args: 'Page not found', me: 'Url Changer'}); 
					}
				} else {
					_isInternalFragChange = false;
				}
			},
			pageEntering : function (newRoute) {
				// Raise flag for the first time
				if (_currentPageRoute === '') {
					_triggerFirstHashChange = true;
				} else {
					//Raise flag for internal change
					_isInternalFragChange = true;
					if (newRoute != _initialDocumentUrl) {
						$.bbq.pushState('#' + newRoute +  _currentPageFragment);
					} else {
						$.bbq.pushState('#');
					}
				}
			},
			pageEntered : function () {
				if (_triggerFirstHashChange) {
					win.trigger('hashchange');
				}
			},
			updateUrlFragment : function () {
				var newVal = _currentPageRoute + _currentPageFragment;
				
				//Raise flag for internal change
				_isInternalFragChange = true;
				
				if (_currentPageRoute[_currentPageRoute.length - 1] == '/' && 
					_currentPageFragment[0] == '/') {
					newVal = _currentPageRoute + _currentPageFragment.substring(1);
				}
				
				$.bbq.pushState('#' + newVal);
				_isInternalFragChange = false;
			},
			_getCurrentUrl: function (defaultValue) {
				var h = window.location.hash;
				if (!!h) {
					return h.replace(/#/gi, '');
				}
				return defaultValue;
			},
			getFullUrl: function () {
				return this._getCurrentUrl(window.location.toString());
			},
			getCurrentUrl: function () {
				return this._getCurrentUrl(window.location.pathname).split('?')[0];
			},
			getQueryString: function () {
				var url = this.getFullUrl();
				var split = url.split('?');
				var qs = '';
				
				if (split.length > 1) {
					split.shift();
					qs = split.join('?');
					if (!!qs && qs.indexOf('?') !== 0) {
						qs += '?' + qs;
					}
				}
				return qs;
			}
		};
	};
	
	var createHistoryStrategy = function () {
		var _isPopingState = false;
		var _triggerFirstFragmentChange = false;
		
		return {
			urlChanged : function () {
				var nextPage = App.pages.page(window.location.pathname);
				
				//if we found a page for this route
				if (nextPage) {
					var loc = window.location;
					//Detect if we change page
					if (nextPage.key() == _currentPageKey) {
						if (!loc.origin) {
							// IE !!
							loc.origin = loc.protocol + '//' + loc.hostname;
						}
						var _cur = loc.origin + _currentPageRoute;
						var pageFragment = loc.href.substring(_cur.length);
						
						if (_currentPageFragment != pageFragment) {
							App.mediator.notify('page.fragmentChanged', pageFragment);
							_currentPageFragment = pageFragment;
						} else {
							App.mediator.notify('page.sameFragmentRequested', pageFragment);
						}
					} else {
						_isPopingState = true;
						App.mediator.goto(loc.pathname + loc.search, _currentPageUrl);
					}
				} else {
					App.log({args: 'Page not found', me: 'Url Changer'}); 
				}
			},
			pageEntering : function (newRoute) {
				var url = newRoute;
				
				if (_currentPageRoute === '') {
					_triggerFirstFragmentChange = true;
				}
				if (_currentPageRoute !== '') {
					url = url + _currentPageFragment;
				
					if (!_isPopingState) {
						history.pushState({}, document.title, newRoute + _currentPageFragment);
					}
					_isPopingState = false;
				}
				
			},
			pageEntered : function () {
				if (_triggerFirstFragmentChange) {
					//Detect if we have a fragment
					var href = window.location.href;
					var curPageHref = window.location.protocol + '//' + 
						window.location.host + _currentPageRoute;
					_currentPageFragment = href.substring(curPageHref.length);
					App.mediator.notify('page.fragmentChanged', _currentPageFragment);
				}
			},
			updateUrlFragment : function () {
				history.pushState({}, document.title, _currentPageRoute + _currentPageFragment);
			},
			getCurrentUrl: function () {
				return window.location.pathname;
			},
			getQueryString: function () {
				return window.location.search;
			},
			getFullUrl: function () {
				return window.location.toString();
			}
		};
	};
	
	var _strategies = {
		hash: createHashStrategy(),
		history: createHistoryStrategy()
	};
	
	var _currentStrategy = _strategies.hash;
	
	var _getLanguageIndex = function () {
		return $('body').hasClass('fr') ? 0 : 1;
	};
	
	var _getNextRouteFromData = function (data) {
		return data.page.routes()[_getLanguageIndex()];
	};
	
	var _extractFragmentFromRoute = function (nextRoute, reelRoute) {
		var	starIndex = !nextRoute ? -1 : nextRoute.indexOf('*');
		
		if (starIndex > -1) {
			nextRoute = nextRoute.substring(0, starIndex);
			
			//We got some fragment also
			if (reelRoute.length > nextRoute.length) {
				_currentPageFragment = reelRoute.substring(starIndex);
				_extractQS();
			} else {
				//Clear fragment?
				_currentPageFragment = '';
				_currentQsFragment	= {};
			}
		} else {
			//Keep Search and Hash has a fragment if we have a # or ? after the 
			if (reelRoute.length > nextRoute.length) {
				var charAfter = reelRoute[nextRoute.length];
				
				if (charAfter === '#' || charAfter === '?') {
					_currentPageFragment = reelRoute.substring(nextRoute.length);
					_extractQS();
				}
			} else {
				//Clear fragment?
				_currentPageFragment = '';
				_currentQsFragment	= {};
			}
		}
		return nextRoute;
	};
	
	var _extractQS = function () {
		var QSIndex = _currentPageFragment.indexOf('?');
		if (QSIndex > -1) {
			_currentQsFragment = window.QueryStringParser.parse(
				_currentPageFragment.substring(QSIndex)
			);
		} else {
			_currentQsFragment = {};
		}
	};
	
	/** Module **/
	var onPageEntering = function (key, data, e) {
		var nextRoute = _extractFragmentFromRoute(_getNextRouteFromData(data), data.route);
		
		//Update browser url if we change page route
		if (_currentPageRoute != nextRoute) {
			//Keep a copy of the currentPage url
			_currentStrategy.pageEntering(nextRoute);
			_currentPageRoute = nextRoute;
			_currentPageUrl = data.route;
			_currentPageKey = data.page.key();
			
			$.sendPageView({page: data.route});
		}
	};
	
	var onPageEntered = function (key, data, e) {
		_currentStrategy.pageEntered();
	};
	
	var onPageLeaving = function (key, data, e) {
		//clear the current page fragment
		_currentPageFragment = '';
		//Keep QS sync
		_extractQS();
	};
	
	var onUpdateUrlFragment = function (key, data, e) {
		// Don't do it if we don't have any page url
		if (!!_currentPageRoute) {
			//Keep a copy of the fragment
			_currentPageFragment = data;
			if ($.isPlainObject(data)) {
				//Keep QS sync
				_extractQS();
			}
			_currentStrategy.updateUrlFragment();
			$.sendPageView({page: data.route});
		}
	};
	
	var _generateQsString = function () {
		var result = '';
		
		$.each(_currentQsFragment, function (prop, value) {
			if (!!value) {
				if (!!result.length) {
					result += '&';
				}
				result += (prop + '=' + value);
			}
		});
		
		return result;
	};
	
	var onUpdateQsFragment = function (key, data, e) {
		if ($.isPlainObject(data)) {
			//Update _currentQsFragment
			$.extend(_currentQsFragment, data);
			
			var currentQsIndex = _currentPageFragment.indexOf('?'),
			newQsString = _generateQsString();
			
			if (newQsString !== _currentPageFragment) {
				//Generate new page fragment
				if (!newQsString.length) {
					_currentPageFragment = '';
				} else if (currentQsIndex === -1) {
					_currentPageFragment += '?' + newQsString;
				} else {
					_currentPageFragment = _currentPageFragment.substring(0, currentQsIndex + 1) + 
						newQsString;
				}
				
				//_currentPage
				_currentStrategy.updateUrlFragment();
				$.sendPageView({page: data.route});
			}
		}
	};
	
	var onNavigateToCurrent = function (key, data, e) {
		var _oldFragment = _currentPageFragment;
		
		_extractFragmentFromRoute(_getNextRouteFromData(data), data.route);
		_currentStrategy.updateUrlFragment();
		
		//Set back old fragment to trigger fragment changed
		_currentPageFragment = _oldFragment;
		_extractQS();
		_currentStrategy.urlChanged();
		$.sendPageView({page: data.route});
	};
	
	var _urlChanged = function () {
		_currentStrategy.urlChanged();
	};
	
	var getCurrentUrl = function () {
		return _currentStrategy.getCurrentUrl();
	};
	
	var getQueryString = function () {
		return _currentStrategy.getQueryString();
	};
	var getFullUrl = function () {
		return _currentStrategy.getFullUrl();
	};
	
	var init = function () {
		//Detect good strategy
		if (window.history.pushState) {
			_currentStrategy = _strategies.history;
			win.on('popstate', _urlChanged);
			
		} else if ($.bbq) {
			
			_currentStrategy = _strategies.hash;
			//Attach to hash change
			win.on('hashchange', _urlChanged);
		} else {
			App.log({
				fx: 'error',
				msg: 'Cannot update url : history api and bbq are not found'
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

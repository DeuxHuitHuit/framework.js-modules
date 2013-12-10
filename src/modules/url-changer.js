/**
 * @author Deux Huit Huit
 *
 * Url Changer
 *
 */

(function ($, undefined) {
	
	"use strict";
	
	var 
	
	win = $(window),
	_currentPageKey = "",
	_currentPageUrl = "",
	_currentPageFragment = "",
	_currentQsFragment = {},
	
	createHashStrategy = function() {
		var 
		_initialDocumentUrl = document.location.pathname,
		_isInternalFragChange = false,
		_triggerFirstHashChange = false;
		return {
			urlChanged : function() {
				if(!_isInternalFragChange) {
					var h = document.location.hash;
					
					var	nextPage = App.pages.page(h.length > 1 ? h.substring(1) : document.location.pathname);

					//if we found a page for this route
					if(nextPage) {
						
						//Detect if we change page
						if(nextPage.key() == _currentPageKey) {
							var 
							_cur = _currentPageUrl,
							pageFragment = document.location.hash.substring(_cur.length);
							if(_currentPageFragment != pageFragment || _triggerFirstHashChange) {
								App.mediator.notify("page.fragmentChanged",pageFragment );
								_currentPageFragment = pageFragment;
							}
						} else {
							App.mediator.goto(document.location.hash.substring(1));
						}
					}
				}else {
					_isInternalFragChange = false;
				}
			},
			pageEntering : function(newRoute) {
				// Raise flag for the first time
				if(_currentPageUrl === "") {
					_triggerFirstHashChange = true;
				} else {
					
					//Raise flag for internal change
					_isInternalFragChange = true;
					if(newRoute != _initialDocumentUrl) {
						$.bbq.pushState('#' + newRoute +  _currentPageFragment);
					} else {
						$.bbq.pushState('#');
					}
				}
				
			},
			pageEntered : function() {
				if(_triggerFirstHashChange) {
					win.trigger("hashchange");
				}
			},
			updateUrlFragment : function() {
				//Raise flag for internal change
				_isInternalFragChange = true;
				var newVal = _currentPageUrl + _currentPageFragment;
				if (_currentPageUrl[_currentPageUrl.length-1] == '/' && _currentPageFragment[0] == '/') {
					newVal = _currentPageUrl + _currentPageFragment.substring(1);
				}
				$.bbq.pushState('#' + newVal);
				_isInternalFragChange = false;
			}
		};
	},
	
	createHistoryStrategy = function() {
		var
		_isPopingState = false,
		_triggerFirstFragmentChange = false;
		
		return {
			urlChanged : function() {
				var 
				nextPage = App.pages.page(document.location.pathname);

				//if we found a page for this route
				if(nextPage) {
					
					//Detect if we change page
					if(nextPage.key() == _currentPageKey) {
						var 
						_cur = document.location.origin + _currentPageUrl,
						pageFragment = document.location.href.substring(_cur.length);
						if(_currentPageFragment != pageFragment) {
							App.mediator.notify("page.fragmentChanged",pageFragment );
							_currentPageFragment = pageFragment;
						}
					} else {
						_isPopingState = true;
						App.mediator.goto(document.location.pathname + document.location.search);
					}
					
				}
			},
			pageEntering : function(newRoute) {
				var url = newRoute;
				if(_currentPageUrl === "") {
					_triggerFirstFragmentChange = true;
				}
				if(_currentPageUrl !== "") {
					url = url + _currentPageFragment;
				
					if(!_isPopingState){
						history.pushState({}, document.title, newRoute + _currentPageFragment );
					}
					_isPopingState = false;
				}
				
			},
			pageEntered : function() {
				if(_triggerFirstFragmentChange) {
					//Detect if we have a fragment
					_currentPageFragment = document.location.href.substring((document.location.protocol + '//' + document.location.host + _currentPageUrl).length);
					App.mediator.notify("page.fragmentChanged", _currentPageFragment);
				}
			},
			updateUrlFragment : function() {
				history.pushState({}, document.title, _currentPageUrl + _currentPageFragment );
			}
		};
	},
	
	_strategies = {
		hash : createHashStrategy(),
		history : createHistoryStrategy()
	},
	
	_currentStrategy = _strategies.hash,
	
	_getLanguageIndex = function() {
		return $('body').hasClass('fr')?0:1;
	},
	
	_getNextRouteFromData = function(data) {
		return data.page.routes()[_getLanguageIndex()];
	},
	
	_extractFragmentFromRoute = function(nextRoute,reelRoute) {
		var
		starIndex = nextRoute.indexOf('*');
		
		if(starIndex > -1) {
			nextRoute = nextRoute.substring(0,starIndex);
			
			//We got some fragment also
			if(reelRoute.length > nextRoute.length) {
				_currentPageFragment = reelRoute.substring(starIndex);
				_extractQS();
			}else {
				//Clear fragment?
				_currentPageFragment = '';
				_currentQsFragment	= {};
			}
		}
		return nextRoute;
	},
	
	_extractQS = function() {
		var QSIndex = _currentPageFragment.indexOf('?');
		if(QSIndex > -1) {
			_currentQsFragment = window.QueryStringParser.parse(_currentPageFragment.substring(QSIndex));
		}else {
			_currentQsFragment	= {};
		}
	},
	
	/** Module **/
	onPageEntering = function(key,data,e) {
		var 
		nextRoute = _extractFragmentFromRoute(_getNextRouteFromData(data),data.route);
		
		//Update browser url if we change page route
		if(_currentPageUrl != nextRoute) {
			//Keep a copy of the currentPage url
			_currentStrategy.pageEntering(nextRoute);
			_currentPageUrl = nextRoute;
			_currentPageKey = data.page.key();
			
			$.sendPageView({page:data.route});
		}
	},
	
	onPageEntered = function(key,data,e) {
		_currentStrategy.pageEntered();
	},
	
	onPageLeaving = function(key,data,e) {
		//clear the current page fragment
		_currentPageFragment = "";
		//Keep QS sync
		_extractQS();
	},
	
	onUpdateUrlFragment = function(key,data,e) {
		
		//Dont do it if we dont have any page url
		if(_currentPageUrl !== '') {
			if(typeof data == "object") {
				
			}else {
				//Keep a copy of the fragment
				_currentPageFragment = data;
				//Keep QS sync
				_extractQS();
				
			}
			_currentStrategy.updateUrlFragment();
		}
	},
	
	_generateQsString = function() {
		var result = "",
		c = 0;
		
		for( var prop in _currentQsFragment) {
			if(_currentQsFragment[prop] !== null) {
				if(c > 0) {
					result += "&";
				}
				result += prop + "=" + _currentQsFragment[prop];
				c++;
			}
		}
		return result;
	},
	
	onUpdateQsFragment = function(key,data,e) {
		if(typeof data == "object") {
			//Update _currentQsFragment
			$.extend(_currentQsFragment,data);
			
			var currentQsIndex = _currentPageFragment.indexOf('?'),
			newQsString = _generateQsString();
			
			
			//Generate new page fragment
			if(currentQsIndex === -1) {
				_currentPageFragment += '?' + newQsString;
			}else {
				_currentPageFragment = _currentPageFragment.substring(0,currentQsIndex + 1) + newQsString;
			}
			
			//_currentPage
			_currentStrategy.updateUrlFragment();
		}
	},
	
	onNavigateToCurrent = function(key,data,e) {
		var _oldFragment = _currentPageFragment;
		_extractFragmentFromRoute(_getNextRouteFromData(data),data.route);
		_currentStrategy.updateUrlFragment();
		
		//Set back old fragment to trigger fragment changed
		_currentPageFragment = _oldFragment;
		_extractQS();
		_currentStrategy.urlChanged();
	},
	
	_urlChanged = function() {
		_currentStrategy.urlChanged();
	},
	
	init = function () {
		//Detect good strategy
		if (window.history.pushState) {
			_currentStrategy = _strategies.history;
			win.on( "popstate", _urlChanged );
			
		}else if($.bbq) {
			
			_currentStrategy = _strategies.hash;
			//Attach to hash change
			win.on( "hashchange", _urlChanged );
		}else {
			App.log({fx:'error',msg:"Cannot update url : history api and bbq are not found"});
		}
	},
	
	actions = function () {
		return {
			page: {
				entering : onPageEntering,
				leaving : onPageLeaving,
				enter : onPageEntered,
				updateUrlFragment : onUpdateUrlFragment,
				updateQsFragment : onUpdateQsFragment
			},
			pages : {
				navigateToCurrent : onNavigateToCurrent
			}
		};
	},
	
	urlChanger = App.modules.exports('urlChanger', {
		init: init,
		actions : actions
	});
	
})(jQuery);
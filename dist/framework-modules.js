/*! framework.js-modules - v1.1.0 - - build 304 - 2013-12-27
* https://github.com/DeuxHuitHuit/framework.js-modules
* Copyright (c) 2013 Deux Huit Huit; Licensed MIT */
/**
 * @author Deux Huit Huit
 *
 * Search Bar
 *
 */
(function ($, w, doc, undefined) {

	'use strict';
	
	// French
	if ($('html').attr('lang') == 'fr') {
		jQuery.timeago.settings.strings = {
		   // environ ~= about, it's optional
			prefixAgo : 'Publié il y a',
			prefixFromNow : 'd\'ici',
			seconds : 'moins d\'une minute',
			minute : 'environ une minute',
			minutes : 'environ %d minutes',
			hour : 'une heure',
			hours : '%d heures',
			day : 'un jour',
			days : '%d jours',
			month : 'un mois',
			months : '%d mois',
			year : 'un an',
			years : '%d ans'
		};
	}
	
	/* Search Bar */
	App.components.exports('timeAgo', function _searchBar() {
		
		var page;
		var NB_JOURS = 30 * 24 * 60 * 60 * 1000;
		
		var init = function (_page) {
			page = _page;
			$('time.js-time-ago').each(function (i, e) {
				var t = $(this);
				var d = new Date(t.attr('datetime'));
				if (new Date().getTime() - d.getTime() < NB_JOURS) {
					t.timeago();	
				}
			});
		};
		
		return {
			init : init
			
		};
	
	});
	
})(jQuery, window, document);
/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';
	var linkSelector = '#site a.js-alt-lg-link';
	var win = $(window);
	var linkList = {};
	
	var init = function () {
		
		//Create initial value
		var data = {};
		$('link[rel=alternate][hreflang]', document).each(function () {
			var t = $(this);
			data[t.attr('hreflang')] = t.attr('href');
		});
	
		linkList[document.location.pathname] = data;
	};
	
	var onPageLoaded = function (key, data, e) {
		var linkData = {};
		$(data.data).each(function (i, e) {  
			if ($(e).is('link')) {
				var t = $(e);
				if (t.attr('hreflang')) {
					linkData[t.attr('hreflang')] = t.attr('href');
				}
			}
			if ($(e).is('body')) {
				return true;
			}
		});
		linkList[data.url] = linkData;
	};
	
	var onEnter = function (key, data, e) {
		if (linkList[document.location.pathname]) {
			
			//Update links
			$(linkSelector).each(function () {
				var t = $(this);
				if (linkList[document.location.pathname][t.data('lg')]) {
					t.attr('href', linkList[document.location.pathname][t.data('lg')]);
				}
			});
		}
	};
	
	var actions = {
		pages : {
			loaded : onPageLoaded
		},
		page : {
			enter : onEnter
		}
	};
	
	var AltLanguageLinkUpdater = App.modules.exports('altLanguageLinkUpdater', {
		init: init,
		actions : function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * Blank link targets
 *
 * Listens to
 * 
 * - 
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	/**
	 * @author Deux Huit Huit
	 * 
	 * Link target : Add target blank to all outside link
	 */
	$.fn.extend({
		blankLink: function () {
			/* link target */
			$(this).each(function _eachTarget() {
				var t = $(this);
				var href = t.attr('href');
				
				if (!!href && (/^https?:\/\//.test(href) || /^\/workspace/.test(href))) {
					if (t.attr('target') != '_blank') {
						// must not be in
						if (! /^:\/\//.test(href)) {
							//set target
							t.attr('target', '_blank');
						}
					}
				}
			});
		}
	});
	
	
	var onPageEnter = function (key, data, e) {
		$('a', $(data.page.key())).blankLink();
	};
	
	var init = function () {
		
	};
	
	var actions = {
		page: {
			enter : onPageEnter
		}
	};
	
	var BlankLinkModule = App.modules.exports('blankLinkModule', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);
/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Facebook async parsing
 */
(function ($, undefined) {
	"use strict";
	
	var facebookParse = function () {
		if (!!window.FB && !!window.FB.XFBML) {
			window.FB.XFBML.parse();
		}
	};
	
	var actions = function () {
		return {
			page: {
				entering: facebookParse
			},
			FB: {
				parse: facebookParse
			}
		};
	};
	
	var init = function () {
		facebookParse();
	};
	
	var FBParser = App.modules.exports('FB', {
		init: init,
		actions : actions
	});
	
})(jQuery);
/**
 * @author Deux Huit Huit
 *
 * Format Tweets
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var twitterlink = function (t) {
		return t.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=^>^<]+[^:\.,\)\s*$])/gi, 
			function (m, link) {
				return '<a title="' + m + '" href="' + m + '" target="_blank">' + 
					((link.length > 36) ? link.substr(0, 35) + '&hellip;' : link) + '</a>';
			}
		);
	};
	
	var twitterat = function (t) {
		return t.replace(
/(^|[^\w]+)\@([a-zA-Z0-9_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]{1,15}(\/[a-zA-Z0-9-_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)*)/gi,
			function (m, m1, m2) {
				return m1 + '<a href="http://twitter.com/' + m2 +
					'" target="_blank">@' + m2 + '</a>';
			}
		);
	};
	
	var twitterhash = function (t) {
		return t.replace(/(^|[^&\w'"]+)\#([a-zA-Z0-9_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ^"^<^>]+)/gi, 
			function (m, m1, m2) {
				return m.substr(-1) === '"' || m.substr(-1) == '<' ? 
					m : m1 + '<a href="https://twitter.com/search?q=%23' + m2 +
						'&src=hash" target="_blank">#' + m2 + '</a>';
			}
		);
	};
	 
	window.formatTwitter = function () {
		var t = $(this);
		var text = t.html(); // keep the existing html
		
		if (t.attr('data-formattwitter') !== 'true') {
			text = twitterlink(text);
			text = twitterat(text);
			text = twitterhash(text);
			
			t.html(text);
		
			t.attr('data-formattwitter', 'true');
		}
	};
	
})(jQuery);


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
			
		if (!e.ctrlKey) {
			App.mediator.goto(href);
			return window.pd(e);
		}
	};
	
	var onClickToggle = function (e) {
		var t = $(this);
		var href = t.attr('href');
		
		App.mediator.toggle(href);
		
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
		$('#site').on('click', sel, onClickGoto);
		
		$('#site').on('click', 'a[href^="/"][data-action^="toggle"]', onClickToggle);
	};
	
	var Links = App.modules.exports('links', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * oEmbed module
 * Supports Youtube and Vimeo APIs
 * 
 * APIS for supported players
 * <!-- Vimeo - Froogaloop -->
 * <script src="//a.vimeocdn.com/js/froogaloop2.min.js"></script>
 * <!-- Youtube iframe api -->
 * <script src="//www.youtube.com/iframe_api"></script>
 * <!-- Player api for dailymotion -->
 * <script src="//api.dmcdn.net/all.js"></script>
 */
(function ($, undefined) {

	'use strict';
	
	var	abstractProvider = {
		embed : function (container, id) {
			var iAutoPlayParsed = parseInt(container.attr('data-autoplay'), 10);
			var iframe = this.getIframe(id, iAutoPlayParsed, 10);
			
			iframe.attr('width', '100%');
			iframe.attr('height', '100%');
			container.append(iframe);
			
		},
		
		getIframe : function (id) {
			return $('<iframe/>');
		},
		
		play : function (container) {},
		pause : function (container) {}
	};
	
	var vimeoProvider = $.extend({}, abstractProvider, {
		getIframe : function (id, autoplay) {
			autoplay = autoplay !== undefined ? autoplay : 1;
			return $('<iframe src="http://player.vimeo.com/video/' + id +
				'?autoplay=' + autoplay +
				'&api=1&html5=1' + '"/>');
		},
		
		play : function (container) {
			var player = window.$f($('iframe', container).get(0));
			
			player.api('play');
		},
		
		pause : function (container) {
			var player = window.$f($('iframe', container).get(0));
			player.api('pause');
		}
	});
	
	var youtubeProvider = $.extend({}, abstractProvider, {
		getIframe : function (url, autoplay) {
			var id = url.indexOf('v=') > 0 ? 
				url.substring(url.indexOf('v=') + 2) : url.substring(url.lastIndexOf('/'));
			var autoPlay = autoplay !== undefined ? autoplay : 1;
			var iframe = $('<iframe id="youtube-player-' + id +
				'" src="http://www.youtube.com/embed/' + id +
				'?feature=oembed&autoplay=' + autoPlay +
				'&enablejsapi=1&version=3&html5=1' + '"/>');

			this._player = new window.YT.Player(iframe.get(0));
			return iframe;
		},
		
		play : function (container) {
			this._player.playVideo();
		},
		
		pause : function (container) {
			this._player.pauseVideo();
		}
	});

	var providers = {
		'Vimeo' : vimeoProvider,
		'YouTube' : youtubeProvider
	};
	
	var loadVideo = function (key, videoContainer) {
		var	videoId = videoContainer.data('videoId');
		var videoProvider = providers[videoContainer.data('videoProvider')];
		
		videoProvider.embed(videoContainer, videoId);
	};
	
	var playVideo = function (key, videoContainer) {
		var	videoId = videoContainer.data('videoId');
		var videoProvider = providers[videoContainer.data('videoProvider')];
		
		videoProvider.play(videoContainer);
	};

	var pauseVideo = function (key, videoContainers) {
		videoContainers.each(function eachVideoContainer(index, container) {
			var videoContainer = $(container);
			var videoId = videoContainer.data('videoId');
			var videoProvider = providers[videoContainer.data('videoProvider')];
			
			if (!!videoProvider && 
				!!videoId && 
				!!videoContainer.find('iframe').length) {
				videoProvider.pause(videoContainer);
			}
		});
	};
	
	var playBtnClicked = function (e) {
		var btn = $(this);
		var item = btn.closest('.item-video');
		var videoContainer = $('.item-video-container', item);
		
		loadVideo(null, videoContainer);
		
		btn.fadeOut();
		$('.item-video-container', item).fadeIn();
		
		return window.pd(e);
	};
	
	var init = function () {
		// capture all click in #site: delegate to the link
		$('#site').on('click', 'a.play-button', playBtnClicked);
	};
	
	var actions = {
		loadVideo: loadVideo,
		playVideo: playVideo,
		pauseVideo: pauseVideo
	};
	
	var oEmbed = App.modules.exports('oEmbed', {
		init: init,
		actions : function () {
			return actions;
		}
	});
	
	
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * Share This
 * 
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site = $('#site');
	
	var onApplyButton = function (key, options, e) {
		var docLoc = document.location;
		var url = docLoc.protocol + '//' + docLoc.host + docLoc.pathname;
		var defaultShareThisOption = {
			service: 'sharethis',
			title: document.title,
			url: url,
			type: 'large'
		};
		
		var o = $.extend(defaultShareThisOption, options);
		
		if (!!o.element && !!window.stWidget) {
			//init share this if we found
			window.stWidget.addEntry(o);
		}
	};
	
	var init = function () {
		
	};
	
	var actions = {
		shareThis : {
			applyButton : onApplyButton
		}
	};
	
	var Menu = App.modules.exports('shareThis', {
		init: init,
		actions : function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * Title Updater
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var metaTitle = $('title', document);
	var titleList = {};
	
	
	var init = function () {
		titleList[document.location.pathname] = $('title').text();
	};
	
	var onPageLoaded = function (key, data, e) {
		var title = '';
		$(data.data).each(function (i, e) {  
			if ($(e).is('title')) {
				title = $(e).text();
				return true;
			}
		});
		if (!!!data.url) {
			data.url = document.location.pathname;
		}
		titleList[data.url] = title;
	};
	
	var onEnter = function (key, data, e) {
		if (titleList[document.location.pathname]) {
			document.title = titleList[document.location.pathname];
		}
	};
	
	var actions = {
		pages : {
			loaded : onPageLoaded,
			internal : {
				loaded : onPageLoaded
			}
		},
		page : {
			enter : onEnter,
			internal : {
				enter : onEnter
			}
		}
	};
	
	var TitleUpdater = App.modules.exports('titleUpdater', {
		init: init,
		actions : function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * Toggle when no previous url are present
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var isMultiLangue = true;
	
	var getHomePageUrl = function () {
		if (isMultiLangue) {
			return '/' + $('html').attr('lang') + '/';
		}
		return '/';
	};
	
	var onToggleNoPreviousUrl = function (key, data, e) {
		App.mediator.goto(getHomePageUrl());
	};
	
	var actions = function () {
		return {
			page : {
				toggleNoPreviousUrl : onToggleNoPreviousUrl
			}
		};
	};
	
	var init = function () {
		
	};
	
	var Links = App.modules.exports('toggleNoPreviousUrl', {
		init: init,
		actions: actions
	});
	
})(jQuery);

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
	
	'use strict';
	
	var transitionList = [];
	var animatingTo = '';
	
	var defaultTransition = function (data, callback) {
			
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
			
		var enterPageAnimation = function () {
			//Notify intering page
			App.modules.notify('page.entering', 
				{page: enteringPage, route: data.route});
			
			domEnteringPage.css({opacity: 1, display: 'block'});
			
			//Animate leaving and start entering after leaving animation
			domLeavingPage.css({display: 'none'});
			
			enteringPage.enter(data.enterNext);
			
			App.callback(callback);
		};
		
		//Default Behavior
		
		//notify all module
		App.modules.notify('page.leaving', {page: leavingPage});
		
		//Leave the current page
		leavingPage.leave(data.leaveCurrent);

		enterPageAnimation();
	};
	
	var onRequestPageTransition = function (key, data, e) {
		var animation = defaultTransition;
		var c = 0;
		
		for (; c < transitionList.length; c++) {
			var it = transitionList[c];
			
			if ((it.from === data.currentPage.key().substring(1) || it.from === '*') &&
				(it.to === data.nextPage.key().substring(1) || it.to === '*')) {
				if (it.canAnimate(data)) {
					animation = it.transition;
					break;
				}
			}
		}
		
		animatingTo = data.nextPage.key().substring(1);
		animation(data, function () {
			animatingTo = '';
		});
		
		//mark as handled
		data.isHandled = true;
	};
	
	var actions = function () {
		return {
			pages: {
				requestPageTransition: onRequestPageTransition
			},
			pageTransitionAnimation : {
				getTargetPage : function (key, data, e) {
					if (!data) {
						data = {
							result : {}
						};
					}
					if (!data.result) {
						data.result = {};
					}
					
					data.result.pageTransitionAnimation = {};
					data.result.pageTransitionAnimation.target = animatingTo;
				}
			}
		};
	};
	
	var init = function () {
		// append 
		$(App.root()).append($('<div id="bg-transition" ></div>'));
	};
	
	var exportsTransition = function (options) {
		var o = $.extend({
			from : '*',
			to : '*',
			transition : defaultTransition,
			canAnimate : function () {
				return true;
			}
		}, options);
		
		if (o.from === '*' && o.to === '*') {
			defaultTransition = o.transition;
		} else {
			transitionList.push(o);	
		}
	};
	
	var PageTransitionAnimation = App.modules.exports('pageTransitionAnimation', {
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
	var _currentPageUrl = '';
	var _currentPageFragment = '';
	var _currentQsFragment = {};
	
	var createHashStrategy = function () {
		var _initialDocumentUrl = document.location.pathname;
		var _isInternalFragChange = false;
		var _triggerFirstHashChange = false;
		
		return {
			urlChanged : function () {
				if (!_isInternalFragChange) {
					var h = document.location.hash;
					
					var	nextPage = App.pages.page(h.length > 1 ? 
						h.substring(1) : document.location.pathname);

					//if we found a page for this route
					if (nextPage) {
						
						//Detect if we change page
						if (nextPage.key() == _currentPageKey) {
							var _cur = _currentPageUrl;
							var pageFragment = document.location.hash.substring(_cur.length);
							
							if (_currentPageFragment != pageFragment || _triggerFirstHashChange) {
								App.mediator.notify('page.fragmentChanged', pageFragment);
								_currentPageFragment = pageFragment;
							}
						} else {
							App.mediator.goto(document.location.hash.substring(1));
						}
					}
				} else {
					_isInternalFragChange = false;
				}
			},
			pageEntering : function (newRoute) {
				// Raise flag for the first time
				if (_currentPageUrl === '') {
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
				var newVal = _currentPageUrl + _currentPageFragment;
				
				//Raise flag for internal change
				_isInternalFragChange = true;
				
				if (_currentPageUrl[_currentPageUrl.length - 1] == '/' && 
					_currentPageFragment[0] == '/') {
					newVal = _currentPageUrl + _currentPageFragment.substring(1);
				}
				
				$.bbq.pushState('#' + newVal);
				_isInternalFragChange = false;
			}
		};
	};
	
	var createHistoryStrategy = function () {
		var _isPopingState = false;
		var _triggerFirstFragmentChange = false;
		
		return {
			urlChanged : function () {
				var nextPage = App.pages.page(document.location.pathname);

				//if we found a page for this route
				if (nextPage) {
					
					//Detect if we change page
					if (nextPage.key() == _currentPageKey) {
						var _cur = document.location.origin + _currentPageUrl;
						var pageFragment = document.location.href.substring(_cur.length);
						
						if (_currentPageFragment != pageFragment) {
							App.mediator.notify('page.fragmentChanged', pageFragment);
							_currentPageFragment = pageFragment;
						}
					} else {
						_isPopingState = true;
						App.mediator.goto(document.location.pathname + document.location.search);
					}
				}
			},
			pageEntering : function (newRoute) {
				var url = newRoute;
				
				if (_currentPageUrl === '') {
					_triggerFirstFragmentChange = true;
				}
				if (_currentPageUrl !== '') {
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
					var href = document.location.href;
					var curPageHref = document.location.protocol + '//' + 
						document.location.host + _currentPageUrl;
					_currentPageFragment = href.substring(curPageHref.length);
					App.mediator.notify('page.fragmentChanged', _currentPageFragment);
				}
			},
			updateUrlFragment : function () {
				history.pushState({}, document.title, _currentPageUrl + _currentPageFragment);
			}
		};
	};
	
	var _strategies = {
		hash : createHashStrategy(),
		history : createHistoryStrategy()
	};
	
	var _currentStrategy = _strategies.hash;
	
	var _getLanguageIndex = function () {
		return $('body').hasClass('fr') ? 0 : 1;
	};
	
	var _getNextRouteFromData = function (data) {
		return data.page.routes()[_getLanguageIndex()];
	};
	
	var _extractFragmentFromRoute = function (nextRoute, reelRoute) {
		var	starIndex = nextRoute.indexOf('*');
		
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
			_currentQsFragment	= {};
		}
	};
	
	/** Module **/
	var onPageEntering = function (key, data, e) {
		var nextRoute = _extractFragmentFromRoute(_getNextRouteFromData(data), data.route);
		
		//Update browser url if we change page route
		if (_currentPageUrl != nextRoute) {
			//Keep a copy of the currentPage url
			_currentStrategy.pageEntering(nextRoute);
			_currentPageUrl = nextRoute;
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
		
		//Dont do it if we dont have any page url
		if (_currentPageUrl !== '') {
			if ($.type(data) != 'object') {
				//Keep a copy of the fragment
				_currentPageFragment = data;
				//Keep QS sync
				_extractQS();
			}
			_currentStrategy.updateUrlFragment();
		}
	};
	
	var _generateQsString = function () {
		var result = '',
		c = 0;
		
		for (var prop in _currentQsFragment) {
			if (_currentQsFragment[prop] !== null) {
				if (c > 0) {
					result += '&';
				}
				result += prop + '=' + _currentQsFragment[prop];
				c++;
			}
		}
		return result;
	};
	
	var onUpdateQsFragment = function (key, data, e) {
		if (typeof data == 'object') {
			//Update _currentQsFragment
			$.extend(_currentQsFragment, data);
			
			var currentQsIndex = _currentPageFragment.indexOf('?'),
			newQsString = _generateQsString();
			
			//Generate new page fragment
			if (currentQsIndex === -1) {
				_currentPageFragment += '?' + newQsString;
			} else {
				_currentPageFragment = _currentPageFragment.substring(0, currentQsIndex + 1) + 
					newQsString;
			}
			
			//_currentPage
			_currentStrategy.updateUrlFragment();
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
	};
	
	var _urlChanged = function () {
		_currentStrategy.urlChanged();
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
	};
	
	var urlChanger = App.modules.exports('urlChanger', {
		init: init,
		actions : actions
	});
	
})(jQuery);
/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	
	var resizeHandler = function (e) {
		App.mediator.notify('site.resize', null, e);
	};
	
	var scrollHandler = function (e) {
		App.mediator.notify('site.scroll', null, e);
	};
	
	var init = function () {
		//Trigger resize
		win.resize(resizeHandler).scroll(scrollHandler);
	};
	
	var WindowNotifier = App.modules.exports('windowNotifier', {
		init: init
	});
	
})(jQuery);

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
	
	var defaultTransition = function (data, callback) {
		
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		var enterPageAnimation = function () {
		
			//Notify intering page
			App.modules.notify('page.entering', {page: enteringPage, route: data.route});
			
			//Animate leaving and start entering after leaving animation
			//Need a delay for get all Loaded
			domEnteringPage.ready(function () {
				domEnteringPage.css({opacity: 1, display: 'block'});
				body.addClass(enteringPage.key().substring(1));
				sitePages.animate({opacity: 1}, 500);
				enteringPage.enter(data.enterNext);
			});
			
		};
		
		body.removeClass(leavingPage.key().substring(1));
		
		sitePages.animate({opacity: 0}, 1000, function () {
			//notify all module
			App.modules.notify('page.leaving', {page: leavingPage});
			
			//Leave the current page
			leavingPage.leave(data.leaveCurrent);
		
			domLeavingPage.hide();
			enterPageAnimation();
			
		});
	};
	
	
	App.transitions.exports({
		transition: defaultTransition,
		canAnimate: function (data) {
			return true;
		}
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * Default page implementation
 *
 */
(function ($, undefined) {

	'use strict';
	
	var onEnter = function (next) {
		App.callback(next);
	};
	
	var init = function () {
		
	};
	
	App.pages.exports('defaultPage', {
		init: init,
		enter : onEnter
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * css3 generators
 * 
 * Makes the use of CSS3 in javascript more easier
 */

(function ($, global, undefined) {
	
	'use strict';
	
	//var VENDOR_PREFIXES = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
	
	// from https://github.com/DeuxHuitHuit/jQuery-Animate-Enhanced/blob/master/scripts/src/jquery.animate-enhanced.js
	var HAS_3D =  ('WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix());
	
	var _getTranslation = function (x, y, z) {
		x = !x || $.isNumeric(x) ? (x||0)+'px' : x;
		y = !y || $.isNumeric(y) ? (y||0)+'px' : y;
		z = !z || $.isNumeric(z) ? (z||0)+'px' : z;
		
		var prefix = (HAS_3D ? '3d(' : '(');
		var suffix = (HAS_3D ? ',' + z + ')' : ')');
		
		return 'translate' + prefix + x + ',' + y + suffix;
	};
	
	var _getRotation = function (x, y, z, theta) {
		x = !x || $.isNumeric(x) ? (x||0) : x;
		y = !y || $.isNumeric(y) ? (y||0) : y;
		z = !z || $.isNumeric(z) ? (z||0) : z;
		theta = !theta || $.isNumeric(theta) ? (theta||0)+'deg' : theta;
		
		var prefix = (HAS_3D ? '3d('  + x + ',' + y + ',' + z + ',' : 'Z(');
		var suffix = (HAS_3D ? ')' : ')');
		
		return 'rotate' + prefix + theta + suffix;
	};
	
	global.CSS3 = {
		translate: _getTranslation,
		rotate: _getRotation,
		prefix: function (key, value) {
			var c = {};
			c[key] = value;
			c['-webkit-'+key] = value;
			c['-moz-'+key] = value;
			c['-ms-'+key] = value;
			c['-o-'+key] = value;
			return c;
		}
	};
	
})(jQuery, window);
/**
 * @author Deux Huit Huit
 *
 * Disable/Enable plugin
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var DISABLED = 'disabled';

	$.fn.disable = function () {
		$(this).attr(DISABLED, DISABLED).addClass(DISABLED);
	};
	
	$.fn.enable = function () {
		$(this).removeAttr(DISABLED).removeClass(DISABLED);
	};
	
})(jQuery);
(function ($) {
	'use strict';
	
	// ga facilitator
	$.sendPageView = function (opts) {
		if (!!window.ga) {
			var defaults = {
				page: window.location.pathname + window.location.search,
				location: window.location.href,
				hostname: window.location.hostname
			};
			var args = !opts ? defaults : $.extend(defaults, opts);
			
			window.ga('send', 'pageview', args);
		}
	};
})(jQuery);
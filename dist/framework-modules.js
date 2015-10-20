/*! framework.js-modules - v0.6.0 - - build  - 2015-10-20
* https://github.com/DeuxHuitHuit/framework.js-modules
* Copyright (c) 2015 Deux Huit Huit; Licensed MIT */
/**
 * @author Deux Huit Huit
 *
 * Article Changer
 *
 */
(function ($, w, doc, undefined) {

	'use strict';

	var animToArticleDefault = function (current, next, o) {
		var afterScroll = function () {
			current.fadeTo(500, 0, function () {
				current.hide();
				
				next.fadeTo(500, 1);
				o.articleEnter(current, next, o);
				setTimeout(function () {
					App.mediator.notify('articleChanger.entering');
				}, 100);
			});
		};
		if (!!current.length) {
			afterScroll();
		} else {
			next.fadeTo(500, 1);
			o.articleEnter(current, next, o);
		}
	};
	
	var appendDefault = function (articleCtn, dataLoaded, pageHandle, o) {
		var article = o.findArticle(dataLoaded, pageHandle, o);
		article.hide();
		articleCtn.append(article);
		return article;
	};
	
	var findArticleDefault = function (articleCtn, pageHandle, o) {
		pageHandle = pageHandle || '';
		var selector = o.articleSelector + 
			(o.trackHandle ? '[data-handle="' + pageHandle + '"]' : '');
		return $(selector, $(articleCtn));
	};
	
	var defOptions = {
		articleSelector: '.js-article',
		containerSelector: '.js-article-ctn',
		findArticle: findArticleDefault,
		appendArticle: appendDefault,
		animToArticle: animToArticleDefault,
		trackHandle: true,
		articleEnter: function (oldItem, newItem, o) {
			if (!o.trackHandle) {
				oldItem.remove();
			}
			App.modules.notify('articleChanger.enter');
		}
	};
	
	App.components.exports('articleChanger', function _articleChanger() {
		var o;
		var page;
		var articleCtn;
		var currentPageHandle;
		
		var init = function (_page, options) {
			page = _page;
			o = $.extend({}, defOptions, options);
			articleCtn = $(o.containerSelector, page);
			currentPageHandle = o.startPageHandle;
		};
		
		var navigateTo = function (newPageHandle, url) {
			var currentPage = o.findArticle(articleCtn, currentPageHandle, o);
			var loadUrl = url || document.location.href;
			var loadSucess = function (dataLoaded, textStatus, jqXHR) {
				//Append New article
				var nextPage = o.appendArticle(articleCtn, dataLoaded, newPageHandle, o);
				var loc = document.location;
				var cleanUrl = loc.href.substring(loc.hostname.length + loc.protocol.length + 2);
				
				App.modules.notify('pageLoad.end');
				App.modules.notify('articleChanger.entering', {url : cleanUrl, data : dataLoaded});
				
				if (!nextPage.length) {
					App.log({
						args: 'Could not find new article',
						fx: 'error',
						me: 'Article Changer'
					});
				} else {
					o.animToArticle(currentPage, nextPage, o);
				}
			};

			if (!o.trackHandle || currentPageHandle !== newPageHandle) {
				
				var nextPage;
				if (o.trackHandle) {
					nextPage = o.findArticle(articleCtn, newPageHandle, o);
				}
				
				// LoadPage
				if (!nextPage || !nextPage.length) {
					App.modules.notify('pageLoad.start', {page: page});
					Loader.load({
						url: loadUrl,
						priority: 0, // now
						vip: true, // bypass others
						success: loadSucess,
						progress: function (e) {
							var total = e.originalEvent.total;
							var loaded = e.originalEvent.loaded;
							var percent = total > 0 ? loaded / total : 0;
							
							App.mediator.notify('pageLoad.progress', {
								event: e,
								total: total,
								loaded: loaded,
								percent: percent
							});
						},
						error: function () {
							App.modules.notify('article.loaderror');
							App.modules.notify('pageLoad.end');
						},
						giveup: function (e) {
							App.modules.notify('pageLoad.end');
						}
					});
					
				} else {
					o.animToArticle(currentPage, nextPage, o);
				}
				
				currentPageHandle = newPageHandle;
			}
		};
		
		return {
			init : init,
			clear : function () { currentPageHandle = ''; },
			navigateTo : navigateTo
		};
	
	});
	
})(jQuery, window, document);

/**
 * @author Deux Huit Huit
 *
 * Article Changer
 *
 */
(function ($, w, doc, undefined) {

	'use strict';
	
	var DEFAULT_DELAY = 350;

	var animToArticleDefault = function (current, next, o) {
		if (!!current.length) {
			var afterScroll = function () {
				current.fadeTo(DEFAULT_DELAY, 0, function () {
					current.hide();
					next.fadeTo(DEFAULT_DELAY, 1);
					o.articleEnter(next);
				});
			};
			if ($.mobile) {
				afterScroll();
			} else {
				$.scrollTo(0, Math.min(500, $(w).scrollTop()), afterScroll);
			}
		} else {
			next.fadeTo(DEFAULT_DELAY, 1);
			o.articleEnter(next);
		}
	};
	
	var appendDefault = function (articleCtn, dataLoaded, pageHandle, o) {
		var article = o.findArticle(dataLoaded, pageHandle, o);
		article.hide();
		articleCtn.append(article);
	};
	
	var findArticleDefault = function (articleCtn, pageHandle, o) {
		pageHandle = pageHandle || '';
		return $(o.articleSelector + '[data-handle="' + pageHandle + '"]', $(articleCtn));
	};
	
	var defOptions = {
		articleSelector: '.js-article',
		containerSelector: '.js-article-ctn',
		findArticle: findArticleDefault,
		appendArticle: appendDefault,
		animToArticle: animToArticleDefault,
		articleEnter: function () {
			App.modules.notify('articleChanger.enter');
		}
	};
	
	App.components.exports('articleChanger', function _articleChanger() {
		
		var o;
		var page;
		var articleCtn;
		var currentPageHandle;
		
		var init = function (_page, options) {
			page = _page;
			o = $.extend({}, defOptions, options);
			articleCtn = $(o.containerSelector, page);
		};
		
		var navigateTo = function (newPageHandle) {
			var currentPage = o.findArticle(articleCtn, currentPageHandle, o);
			var loadSucess = function (dataLoaded, textStatus, jqXHR) {
				//Append New article
				o.appendArticle(articleCtn, dataLoaded, newPageHandle, o);
				var nextPage = o.findArticle(articleCtn, newPageHandle, o);
				
				App.modules.notify('pageLoad.end');
				App.modules.notify('articleChanger.entering');
				
				if (!nextPage.length) {
					App.log({
						args: ['Could not find new article `%s`', newPageHandle],
						fx: 'error',
						me: 'Article Changer'
					});
				} else {
					o.animToArticle(currentPage, nextPage, o);
				}
			};
			if (currentPageHandle !== newPageHandle) {
				
				var nextPage = o.findArticle(articleCtn, newPageHandle, o);
				
				// LoadPage
				if (!nextPage.length) {
					var loc = '';
					App.modules.notify('url.getFullUrl', null, function (key, res) {
						loc = res;
					});
					App.modules.notify('pageLoad.start', {page: page});
					Loader.load({
						url: loc,
						priority: 0, // now
						vip: true, // bypass others
						success: loadSucess,
						progress: function (e) {
							var total = e.originalEvent.total;
							var loaded = e.originalEvent.loaded;
							var percent = total > 0 ? loaded / total : 0;
							
							App.mediator.notify('pageLoad.progress', {
								event: e,
								total: total,
								loaded: loaded,
								percent: percent
							});
						},
						error: function () {
							App.modules.notify('article.loaderror');
							App.modules.notify('pageLoad.end');
						},
						giveup: function (e) {
							App.modules.notify('pageLoad.end');
						}
					});
					
				} else {
					o.animToArticle(currentPage, nextPage, o);
				}
				
				currentPageHandle = newPageHandle;
			}
		};
		
		return {
			init : init,
			clear : function () { currentPageHandle = ''; },
			navigateTo : navigateTo
		};
	
	});
	
})(jQuery, window, document);
/**
 * @author Deux Huit Huit
 *
 * Google maps component
 */
(function ($, win, global, undefined) {

	'use strict';
	
	App.components.exports('googleMap', function (o) {
		
		var container;
		var markers = [];
		var map;
		var openedMarker;
		
		var defaultMapOptions = {
			defaultMarkerOptions: {},
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			markerAction: function () {
				var reelPosition = new google.maps.LatLng(
					this.getPosition().lat() + 0.005,
					this.getPosition().lng());
				map.panTo(reelPosition);
				
				closeAllPopup();
				this['infowindow'].open(map, this);
				openedMarker = this;
			}
		};
		
		var mapOptions = $.extend({}, defaultMapOptions, o);
		
		var addMarker = function (o) {
			
			var markerOption = $.extend({}, mapOptions.defaultMarkerOptions, o);
				
			var marker = new google.maps.Marker({
				position: markerOption.LatLng,
				map: map,
				icon: new google.maps.MarkerImage('/workspace/assets/img/gmap-pin.png',
					new google.maps.Size(24, 42),
					new google.maps.Point(0, 0),
					new google.maps.Point(12, 42)
				),
				shadow: markerOption.iconShadow,
				zIndex: markerOption.zIndex
			});
			
			markers.push(marker);
			
			//If we have content add the infoWindow
			if (markerOption.content && markerOption.content.length) {
			
				marker['infowindow'] = new google.maps.InfoWindow(
					{
						content: markerOption.content
					}
				);
				
				google.maps.event.addListener(marker, 'click', mapOptions.markerAction);
			} else if (mapOptions.markerCustomAction) {
				google.maps.event.addListener(marker, 'click', mapOptions.markerCustomAction);
			}
		};
		
		var closeAllPopup = function () {
			if (openedMarker) { 
				openedMarker['infowindow'].close();
			}
		};
		
		var createMap = function () {
			map = new google.maps.Map(container.get(0), mapOptions);
			
			google.maps.event.addListener(map, 'bounds_changed', function () {
				//notify page that bounds changed
				App.mediator.notifyCurrentPage('map.boundsChanged', map.getBounds());
			});
		};
		
		var googleMap = function () {
			return !!global.google && !!google.maps && !!google.maps.Map;
		};
		
		var initMap = function () {
			if (!container.hasClass('map-loaded')) {
				createMap();
				container.addClass('map-loaded');
			}
		};
		
		var init = function (_page, selector) {
			container = $(selector, _page);
			App.loaded(googleMap, function () {
				initMap();
			});
		};
		
		return {
			init: init,
			addMarker: addMarker,
			center: function (lat, lng) {
				map.panTo(new google.maps.LatLng(lat, lng));
			},
			closeAllPopup: closeAllPopup
		};
	});
	
})(jQuery, jQuery(window), window);

/**
 * @author Deux Huit Huit
 * 
 * jPlayer
 */
 
(function ($, win, undefined) {

	'use strict';
	
	App.components.exports('jplayer', function (o) {
		
		var container;
		var defaultOptions = {
			playerSelector: '.js-jplayer-player',
			playerContainerSelector: '.js-jplayer-container',
			onReady: null,
			onTimeupdate: null,
			backgroundColor: 'transparent',
			loop: true,
			width: 1920,
			height: 1080,
			resize: true
		};
		
		var options = $.extend({}, defaultOptions, o);
		
		//Partie pour les players video
		var loadAllVideo = function () {
			var playerCtn = container.find(options.playerContainerSelector);
			
			playerCtn.each(function () {
				var ctn = $(this);
				loadVideo(ctn);
			});
		};
		
		var loadVideo = function (ctn) {
			var player = ctn.find(options.playerSelector);
				
			player.jPlayer({
				ready: function () {
					var t = $(this);
					t.jPlayer('setMedia', {
						webmv: ctn.attr('data-video-webm'),
						m4v: ctn.attr('data-video-mp4'),
						ogv: ctn.attr('data-video-ogv')
					});
					
					if (options.resize) {
						resizeVideo(ctn);
					}
					
					App.callback(options.onReady, [ctn]);
				},
				solution: 'html, flash',
				swfPath: '//cdnjs.cloudflare.com/ajax/libs/jplayer/2.5.4/',
				loop: options.loop,
				volume: 0,
				supplied: 'webmv, m4v, ogv',
				backgroundColor: options.backgroundColor,
				wmode: options.backgroundColor,
				size: {
					width: options.width,
					height: options.height
				},
				preload: options.preload || 'none',
				play: function (e) {
					App.mediator.notify('jplayer.play', {ctn: ctn});
					
				},
				timeupdate: function (e) {
					var status = e.jPlayer.status;
					
					if (!!status.currentTime) {
						App.mediator.notify('jplayer.timeupdate', {status: status, ctn: ctn});
					}
					
					App.callback(options.onTimeupdate, [ctn, status]);
				},
				ended: function () {
					App.callback(options.onEnded, [ctn]);
				}
			});
		};
		
		var resizeVideo = function (playerCtn) {
			var ctnWidth = playerCtn.width();
			var ctnHeight = playerCtn.height();
			var player = playerCtn.find(options.playerSelector);
			
			var newSize = $.sizing.aspectFill({
				width: ctnWidth,
				height: ctnHeight,
				preferWidth: false
			}, options.width / options.height);
			var newPosition = $.positioning.autoPosition({
				position: 'center',
				left: 'left',
				top: 'top'
			}, $.size(ctnWidth, ctnHeight), newSize);

			player.size(newSize).css(newPosition).data({
				size: newSize,
				position: newPosition
			});

			player.jPlayer('option', {size: newSize});
		};
		
		var resizeAllVideo = function () {
			container.find(options.playerContainerSelector).each(function () {
				resizeVideo($(this));
			});
		};
		
		var destroyVideo = function (playerCtn) {
			var player = playerCtn.find(options.playerSelector);
			
			player.jPlayer('destroy');
			player.jPlayer('pauseOthers');
		};
		
		var destroyAllVideo = function () {
			container.find(options.playerContainerSelector).each(function () {
				var t = $(this);
				
				destroyVideo(t);
				t.removeClass('video-loaded').closest('.video-loaded').removeClass('video-loaded');
			});
		};
		
		var playVideo = function (playerCtn) {
			var player = playerCtn.find(options.playerSelector);
			player.jPlayer('pauseOthers');
			player.jPlayer('play');
		};
		
		var pauseVideo = function (playerCtn) {
			var player = playerCtn.find(options.playerSelector);
			
			player.jPlayer('pause');
		};
		
		var stopVideo = function (playerCtn) {
			var player = playerCtn.find(options.playerSelector);
			
			player.jPlayer('stop');
		};
		
		//_container délimite ou je veux écouté mes évenement 
		//(page ou site, ce qui a été spécifier lors du init)
		var init = function (_container) {
			container = $(_container);
		};
		
		return {
			init: init,
			loadAllVideo: loadAllVideo,
			loadVideo: loadVideo,
			destroyVideo: destroyVideo,
			destroyAllVideo: destroyAllVideo,
			playVideo: playVideo,
			pauseVideo: pauseVideo,
			stopVideo: stopVideo,
			resizeVideo: resizeVideo,
			resizeAllVideo: resizeAllVideo
		};
	});
	
})(jQuery, jQuery(window));

/**
 * @author Deux Huit Huit
 *
 * Time Ago
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
	
	/* Time Ago */
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
		if (data.data) {
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
		}
	};
	
	var onEnter = function (key, data, e) {
		if (linkList[document.location.pathname]) {
			
			//Update links
			$(linkSelector).each(function () {
				var t = $(this);
				var value = linkList[document.location.pathname][t.data('lg')];
				
				if (value) {
					t.attr('href', value);
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
 * Window Notifier
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	
	var pageEnter = function (key, data) {
		//var p = $(data.page.key());
		
		$('.js-cycle:not(.cycle-inited)').each(function () {
			var t = $(this);
			
			if (!t.data('cycle-disable-mobile') || !$.mobile) {
				var o = {
					slides: t.attr('data-cycle-slides') || '>img',
					pager: t.attr('data-cycle-pager') || '> .cycle-pager',
					pagerTemplate: t.attr('data-cycle-pager-template') || '<span><span>',
					next: t.attr('data-cycle-next') || '> .cycle-next',
					prev: t.attr('data-cycle-prev') || '> .cycle-prev',
					timeout: t.attr('data-cycle-timeout') || 4000,
					paused: t.attr('data-cycle-paused') || false,
					pauseOnHover: t.attr('data-cycle-pause-on-hover') || false,
					fx: t.attr('data-cycle-fx') || 'fade',
					captionTemplate: t.attr('data-cycle-caption-template') || '',
					log: App.debug()
				};
				
				t.cycle(o);
				
				t.addClass('cycle-inited');
			}
		});
	};
	
	var init = function () {
		
	};
	
	var actions = function () {
		return { 
			/*site: {
				resize: onResize
			},*/
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			}
		};
	};

	App.modules.exports('auto-cycle',  { 
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * auto jit image
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var firstTime = true;
	
	var onEnter = function (key, data) {
		if (!firstTime) {
			$(data.page.key()).find('img[data-src-format]').jitImage();
		}
		firstTime = false;
	};
	
	var actions = function () {
		return {
			page: {
				enter: onEnter
			}
		};
	};
	
	var AutoJitImage = App.modules.exports('auto-jit-image', {
		actions: actions
	});
	
})(jQuery, window);
/**
 * @author Deux Huit Huit
 * 
 * Auto ratio size
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site;
	var sitePages;
	
	var getPage = function () {
		return $('> .page:visible', sitePages);
	};
	
	var parseRatio = function (ratio) {
		if (!ratio) {
			return 1;
		}
		var r = ratio.toString().split(/[:\/]/i);
		if (!r.length) {
			return 1;
		} else if (r.length === 1) {
			return parseFloat(r[0]);
		} else if (r.length === 2) {
			return parseInt(r[0], 10) / (parseInt(r[1], 10) || 1);
		}
		return -1;
	};
	
	var defaultCallback = function () {
		App.mediator.notifyCurrentPage('autoRatio.resizeCompleted');
	};
	
	var onResize = function () {
		updateElements($('*[data-auto-ratio]', getPage()), defaultCallback);
	};
	
	var updateElements = function (elements, callback) {
		elements.each(function () {
			var t = $(this);
			var r =  parseRatio(t.attr('data-auto-ratio'));
			var fx = t.attr('data-auto-ratio-property') || 'height';
			var val;
			
			if (fx == 'width' || fx == 'max-width') {
				val = t.height();
			} else {
				val = t.width();
			}
			val = ~~Math.floor(val / r);
			
			t.css(fx, val + 'px');
			
			$('img[data-src-format]', t).jitImage();
		});
		
		App.callback(callback);
	};
	
	var onPageEnter = function () {
		onResize();
	};
	
	var update = function (key, data) {
		if (data && data.elements) {
			updateElements(
				data.elements, 
				(data.callback ? data.callback : defaultCallback)
			);
		} else {
			onResize();
		}
	};
	
	var init = function () {
		site = $('#site');
		sitePages = $('#site-pages', site);
		onResize();
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: onPageEnter
			},
			autoRatioSize: {
				update: update
			},
			articleChanger: {
				enter: onPageEnter
			}
		};
	};
	
	App.modules.exports('auto-ratio-size', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 * 
 * Auto screen height
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	
	var mobileHeight = 0;
	
	var getPage = function () {
		return $('.page:visible');
	};
	
	var platforms = {
		'all': true,
		'desktop': !$.mobile,
		'tablette': $.tablette,
		'mobile': $.mobile,
		'phone': $.phone
	};
		
	var getOffsetTotal = function (itemsArray) {
		var total = 0;
		
		if (itemsArray) {
		
			var its = itemsArray.split(',');
			$.each(its, function (i, value) {
				total += $(value).height();
			});
		}
		return total;
	};
	
	var processPlatforms = function (itemsArray) {
		var result = false;
		
		if (itemsArray) {
		
			var its = itemsArray.split(',');
			$.each(its, function (i, value) {
				if (platforms[value]) {
					result = true;
				}
			});
		}
		return result;
	};
	
	var resizeItem = function () {
		var t = $(this);
		var ratio = t.attr('data-height-ratio') || 1;
		var fx = t.attr('data-height-property') || 'minHeight';
		var offset = getOffsetTotal(t.attr('data-height-offset'));
		var newHeight = (win.height() - offset) * ratio;
		var platformsVal = processPlatforms(t.attr('data-screen-height-platform') || 'all');
		var minWidth = t.attr('data-screen-height-min-width') || 0;
		var useMediaQuery = t.data('data-screen-height-use-media-query') || true;
		var useJitImage = t.attr('data-screen-height-jitimage') || true;
		
		//test platforms
		if (platformsVal &&
			!useMediaQuery &&
			win.width() > minWidth) {
				
			t.css(fx, newHeight);
			
		} else if (platformsVal && 
			useMediaQuery && 
			window.matchMedia('(min-width: ' + minWidth + 'px)').matches) {
			t.css(fx, newHeight);
		} else {
			t.css(fx, '');
		}
		if (useJitImage) {
			$('img[data-src-format]', t).jitImage();
		}
	};
	
	var onResize = function (e) {
		var p = getPage();
		if (($.mobile && Math.abs(mobileHeight - win.height()) > 120) || !$.mobile) {
			p.filter('.js-auto-screen-height')
				.add($('.js-auto-screen-height', p))
				.each(resizeItem);
			mobileHeight = win.height();
		}
	};
	
	var onEnter = function () {
		mobileHeight = 0;
		onResize();
		if ($.mobile) {
			mobileHeight = win.height();
		}
		
		setTimeout(onResize, 100);
	};
	
	var init = function () {
		onResize();
		if ($.mobile) {
			mobileHeight = win.height();
		}
	};
	
	var actions = function () {
		return { 
			site: {
				resize: onResize
			},
			page: {
				enter: onEnter
			},
			autoScreenHeight: {
				update: onResize
			},
			articleChanger: {
				entering: onResize
			}
		};
	};

	App.modules.exports('auto-screen-height', {
		init: init,
		actions: actions
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
	
	var getCurrentUrl = function () {
		var docLoc = document.location;
		return docLoc.protocol + '//' + docLoc.host + docLoc.pathname;
	};
	
	var attachBtn = function (btn) {
		
		App.modules.notify('shareThis.applyButton', {
			service: btn.attr('data-share-service') || 'sharethis',
			title: btn.attr('data-share-title') || document.title,
			url: btn.attr('data-share-url') || getCurrentUrl(),
			type: btn.attr('data-share-type') || 'large',
			element: btn.eq(0)[0]
		});
	};
	
	var autoAttach = function (key, data) {
		$('.js-share-this-btn').each(function () {
			attachBtn($(this));
		});
	};
	
	var init = function () {
	
	};
	
	var actions = {
		articleChanger: {
			enter: autoAttach
		},
		page: {
			enter: autoAttach
		}
	};
	
	App.modules.exports('autoShareThis', {
		init: function () {},
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
					if (!t.attr('target')) {
						t.attr('target', '_blank');
					}
				}
			});
		}
	});
	
	
	var onPageEnter = function (key, data, e) {
		$('a', $(data.page.key())).blankLink();
	};
	
	var init = function () {
		$('a').blankLink();
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
/**
 * @author Deux Huit Huit
 * 
 * Defered css
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var actions = function () {
		return {
			site: {
				loaded: function () {
					$('link[data-href]').each(function () {
						var t = $(this);
						t.attr('href', t.attr('data-href'));
					});
				}
			}
		};
	};
	
	var DeferedCss = App.modules.exports('defered-css', {
		actions: actions
	});
	
})(jQuery, window);
/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Facebook async parsing
 */
(function ($, undefined) {
	'use strict';
	
	var facebookParse = function (key, data) {
		if (!!window.FB && !!window.FB.XFBML) {
			data = data || {};
			window.FB.XFBML.parse(data.elem || document, function () {
				facebookResize(key, {
					elem: data.elem || $('.page:visible', App.root())
				});
			});
		}
	};
	
	var facebookResize = function (key, data) {
		if (!data) {
			return;
		}
		data.elem.find('.fb-comments').each(function (index, elem) {
			var ctn = $(elem);
			var w = ctn.width();
			
			if (w > 100) {
				ctn
					.attr('data-width', w)
					.find('>span>iframe, >span:first-child').width(w);
			}
		});
	};
	
	var actions = function () {
		return {
			page: {
				enter: facebookParse
			},
			FB: {
				parse: facebookParse,
				resize: facebookResize
			},
			articleChanger: {
				enter: facebookParse
			},
			site: {
				loaded: facebookParse
			}
		};
	};
	
	var FBParser = App.modules.exports('FB', {
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
/(^|[^\w]+)\@([a-zA-Z0-9_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]{1,15}(\/[a-zA-Z0-9-_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)*)/gi, // jshint ignore:line
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
(function ($, global, undefined) {

	'use strict';
	
	var	abstractProvider = {
		embed: function (container, id) {
			var iAutoPlayParsed = parseInt(container.attr('data-autoplay'), 10);
			var iRelatedVideo = container.attr('data-rel') === '1' ? 1 : 0;
			var extra = container.attr('data-extra');
			var iframe = this.getIframe(id, iAutoPlayParsed, iRelatedVideo, extra);
			
			iframe.attr('width', '100%');
			iframe.attr('height', '100%');
			iframe.attr('frameborder', '0');
			container.append(iframe);
		},
		
		getIframe : function (id) {
			return $('<iframe allowfullscreen="" />');
		},
		
		play: function (container) {},
		pause: function (container) {}
	};
	
	var $f = function () {
		return global.$f;
	};
	
	var YT = function () {
		return !!global.YT ? global.YT.Player : false;
	};
	
	var vimeoProvider = $.extend({}, abstractProvider, {
		getIframe: function (id, autoplay, rel, extra) {
			autoplay = autoplay !== undefined ? autoplay : 1;
			return abstractProvider.getIframe()
				.attr('src', '//player.vimeo.com/video/' + id +
						'?autoplay=' + autoplay +
						'&api=1&html5=1&rel=' + rel + (extra || ''));
		},
		
		play: function (container) {
			App.loaded($f, function ($f) {
				var player = $f($('iframe', container).get(0));
				
				player.api('play');
			});
		},
		
		pause: function (container) {
			App.loaded($f, function ($f) {
				var player = global.$f($('iframe', container).get(0));
				
				player.api('pause');
			});
		}
	});
	
	var youtubeProvider = $.extend({}, abstractProvider, {
		getIframe: function (url, autoplay, rel, extra) {
			var id = url.indexOf('v=') > 0 ? 
				url.match(/v=([^\&]+)/mi)[1] : url.substring(url.lastIndexOf('/'));
			var autoPlay = autoplay !== undefined ? autoplay : 1;
			var iframe = abstractProvider.getIframe()
				.attr('id', 'youtube-player-' + id)
				.attr('src', '//www.youtube.com/embed/' + id + 
					'?feature=oembed&autoplay=' + autoPlay + 
					'&enablejsapi=1&version=3&html5=1&rel=' + rel + (extra || ''));
			
			App.loaded(YT, function (Player) {
				youtubeProvider._player = new Player(iframe.get(0));
			});
			
			return iframe;
		},
		
		play: function (container) {
			App.loaded(YT, function (Player) {
				this._player.playVideo();
			});
		},
		
		pause: function (container) {
			App.loaded(YT, function (Player) {
				this._player.pauseVideo();
			});
		}
	});

	var providers = {
		Vimeo: vimeoProvider,
		YouTube: youtubeProvider
	};
	
	var loadVideo = function (key, videoContainer) {
		var	videoId = videoContainer.data('videoId');
		var videoProvider = providers[videoContainer.data('videoProvider')];
		
		if (!videoProvider) {
			App.log({args: ['Provider `%s` not found.', videoProvider], me: 'oEmbed', fx: 'warn'});
		} else {
			videoProvider.embed(videoContainer, videoId);
		}
	};
	
	var playVideo = function (key, videoContainer) {
		var	videoId = videoContainer.data('videoId');
		var videoProvider = providers[videoContainer.data('videoProvider')];
		
		if (!videoProvider) {
			App.log({args: ['Provider `%s` not found.', videoProvider], me: 'oEmbed', fx: 'warn'});
		} else {
			videoProvider.play(videoContainer);
		}
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
		
		return global.pd(e);
	};
	
	var init = function () {
		// capture all click in #site: delegate to the link
		$('#site').on($.click, 'a.play-button', playBtnClicked);
	};
	
	var actions = {
		loadVideo: loadVideo,
		playVideo: playVideo,
		pauseVideo: pauseVideo
	};
	
	var oEmbed = App.modules.exports('oEmbed', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery, window);

/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Page loading handling
 *
 * Use load progress if available, reverts to good old timer if not.
 *
 */
(function ($, undefined) {

	'use strict';
	
	var INITIAL_VALUE = 0.30; // 30%
	var INCREMENT = 0.05; // 5%
	var CLOSE_DELAY = 500; // ms
	var START_DELAY = 300; // ms
	var PROGRESS_DELAY = 150; //ms
	
	var LOADING = 'page-loading';
	var SHOW = 'show';
	var START = 'start';
	var END = 'end';
	
	var html = $();
	var holder = $();
	
	var isStarted = false;
	
	var closeTimer = 0;
	var currentValue = 0;
	var progressTimer = 0;
	
	var p = function (i) {
		return ~~(i * 100) + '%';
	};
	
	var start = function () {
		clearTimeout(closeTimer);
		
		currentValue = INITIAL_VALUE;
		
		holder
			.removeClass(END)
			.removeClass(SHOW)
			.removeClass(START)
			.width(p(0))
			.height();
		holder
			.addClass(START)
			.addClass(SHOW)
			.width(p(currentValue))
			.height();
		
		html.addClass(LOADING);
		
		isStarted = true;
		
		App.log({args: 'Start', me: 'page-load'});
		
		setTimeout(progress, START_DELAY);
	};
	
	var end = function () {
		holder
			.addClass(END)
			.width('100%');
			
		isStarted = false;
		
		closeTimer = setTimeout(function () {
			holder.removeClass(SHOW);
			html.removeClass(LOADING);
		}, CLOSE_DELAY);
		
		App.log({args: 'End', me: 'page-load'});
	};
	
	var progress = function (percent) {
		clearTimeout(progressTimer);
		if (isStarted) {
			// increment current value
			var incVal = currentValue + INCREMENT;
			// use percent if greater then new incremented value
			currentValue = Math.max(incVal, percent || currentValue);
			// max out current value to 1
			currentValue = Math.min(currentValue, 1);
			// update ui
			holder.width(p(currentValue));
			// if we are running with the timer (not percent given)
			// block before hitting 100%
			if (!percent && currentValue < 1 - INCREMENT) {
				progressTimer = setTimeout(progress, PROGRESS_DELAY);
			}
		}
		App.log({
			args: ['Progress %s %s', percent || 'timer', currentValue],
			me: 'page-load'
		});
	};
	
	var loadprogress = function (key, data) {
		progress(data.percent);
	};
	
	var actions = function () {
		return {
			pageLoad: {
				start: start,
				progress: loadprogress,
				end: end
			},
			pages: {
				loading: start,
				loadfatalerror: end,
				loadprogress: loadprogress,
				loaded: end,
				notfound: end
			}
		};
	};
	
	var init = function () {
		html = $('html');
		holder = $('#load-progress');
	};
	
	var PageLoad = App.modules.exports('page-load', {
		init: init,
		actions : actions
	});
	
})(jQuery);
/******************************
 * @author Deux Huit Huit
 ******************************/

/**
 * Route not found handling
 */
(function ($, undefined) {

	'use strict';
	
	var actions = function () {
		return {
			pages: {
				routeNotFound: function (key, data) {
					if (!!data && !!data.url && data.url !== document.location.pathname) {
						document.location = data.url;
					}
				}
			}
		};
	};
	
	var RouteNotFound = App.modules.exports('route-not-found', {
		actions : actions
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
		
		// block clicks
		$(o.element).on($.click, function (e) {
			return window.pd(e, false);
		});
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
 * Module Site Error
 */
(function ($, global, undefined) {
	'use strict';

	var oldOnError = global.onerror;
	
	var errorHandler = function (errorMsg, url, lineNumber, column, errorObj) {
		errorMsg = errorMsg || '';
		if (!!url) {
			errorMsg += ' ' + url;
		}
		if (!!lineNumber) {
			errorMsg += ' line ' + lineNumber;
		}
		if (!!column) {
			errorMsg += ' col ' + column;
		}
		if (!!errorObj && !!errorObj.stack) {
			errorMsg += ' col ' + errorObj.stack;
		}
		// Log via Google Analytics
		$.sendEvent('error', errorMsg);
		// Call default
		return App.callback(oldOnError, errorMsg, url, lineNumber, column, errorObj);
	};

	// Trap js errors
	global.onerror = errorHandler;
	
	// Trap js errors
	$(document).ajaxError(function (e, request, settings) {
		$.sendEvent('error ajax', settings.url, e.result);
	});

})(jQuery, window);

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
		if (data.data) {
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
		}
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
	
	var defaultBeginTransition = function (data) {
		
	};
	
	var getTransitionObj = function (data) {
		var c = 0;
		
		for (; c < transitionList.length; c++) {
			var it = transitionList[c];
			
			if ((it.from === data.currentPage.key().substring(1) || it.from === '*') &&
				(it.to === data.nextPage.key().substring(1) || it.to === '*')) {
				if (it.canAnimate(data)) {
					return it;
				}
			}
		}
	};
	
	var onRequestBeginPageTransition = function (key, data) {
		var beginAnimation = defaultBeginTransition;
		
		var anim = getTransitionObj(data);
		if (anim) {
			beginAnimation = anim.beginTransition;
		}
		
		animatingTo = data.nextPage.key().substring(1);
		beginAnimation(data);
		
	};
	
	var onRequestPageTransition = function (key, data, e) {
		var animation = defaultTransition;
		
		var anim = getTransitionObj(data);
		if (anim) {
			animation = anim.transition;
		}
		
		
		animation(data, function () {
			animatingTo = '';
		});
		
		//mark as handled
		data.isHandled = true;
	};
	
	var actions = function () {
		return {
			pages: {
				requestPageTransition: onRequestPageTransition,
				requestBeginPageTransition: onRequestBeginPageTransition
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
			beginTransition: defaultBeginTransition,
			transition : defaultTransition,
			canAnimate : function () {
				return true;
			}
		}, options);
		
		if (o.from === '*' && o.to === '*') {
			defaultTransition = o.transition;
			defaultBeginTransition = o.beginTransition;
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

/**
 * @author Deux Huit Huit
 * 
 * Window Notifier
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var doc = $(document);
	
	var notify = function (key, e) {
		App.mediator.notify('site.' + key, {event: e});
	};
	
	var resizeHandler = function (e) {
		notify('resize', e);
	};
	
	var orientationHandler = function (e) {
		notify('orientation', e);
		resizeHandler();
	};
	
	var scrollHandler = function (e) {
		notify('scroll', e);
		notify('postscroll', e);
	};
	
	var loadHandler = function (e) {
		notify('loaded', e);
	};
	
	var visibilityHandler = function (e) {
		var state = document.visibilityState || document.webkitVisibilityState || 'visible';
		notify('visibilitychange', e, state);
	};
	
	var init = function () {
		win
			.load(loadHandler)
			.scroll(scrollHandler)
			.on('orientationchange', orientationHandler);
		if (!$.ios) {
			win.resize(resizeHandler);
		}
		doc
			.on('visibilitychange webkitvisibilitychange', visibilityHandler);
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
	
	var DEFAULT_DELAY = 350;
			
	var beginCompleted = false;
	var loadCompleted = false;

	var dataIn = null;
	
	var defaultTransition = function (data, callback) {
		loadCompleted = true;
		dataIn = data;
		if (beginCompleted) {
			completeAnim(data, callback);
		}
	};
	
	var completeAnim = function (data, callback) {
		var bgTransition = $('#bg-transition', body);
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		body.addClass(enteringPage.key().substring(1));
		//Notify intering page
		App.modules.notify('page.entering', {page: enteringPage, route: data.route});
		
		//Animate leaving and start entering after leaving animation
		//Need a delay for get all Loaded
		domEnteringPage.ready(function () {
			domEnteringPage.css({opacity: 1, display: 'block'});
			enteringPage.enter(data.enterNext);
			
			bgTransition.fadeOut(DEFAULT_DELAY).promise().then(function () {
				App.modules.notify('transition.end', {page: enteringPage, route: data.route});
			});
			
			App.callback(callback);
		});
	};
	
	var defaultBeginTransition = function (data, callback) {
		var bgTransition = $('#bg-transition', body);
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		beginCompleted = false;
		loadCompleted = false;
		dataIn = null;
		bgTransition.fadeIn(DEFAULT_DELAY).promise().then(function () {
			//notify all module from leaving
			body.removeClass(leavingPage.key().substring(1));
			App.modules.notify('page.leaving', {page: leavingPage});
			
			win.scrollTop(0);
			
			//Leave the current page
			leavingPage.leave(data.leaveCurrent);
		
			domLeavingPage.hide();
			beginCompleted = true;
			
			if (loadCompleted) {
				completeAnim(dataIn);
			}
		});
	};
	
	App.transitions.exports({
		beginTransition: defaultBeginTransition,
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

(function ($, global, undefined) {

	'use strict';
	
	App.pages.exports('defaultPage', function () {
		var page;
		
		var onEnter = function (next) {
			App.callback(next);
		};
		
		var init = function () {
			page = $(this.key());
		};
		
		var actions = function () {
			return {
				
			};
		};
		
		var self = {
			init: init,
			enter: onEnter,
			actions: actions
		};
		
		return self;
	});
	
})(jQuery, window);

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
	
	/* jshint ignore:start */
	// from https://github.com/DeuxHuitHuit/jQuery-Animate-Enhanced/
	// blob/master/scripts/src/jquery.animate-enhanced.js
	/* jshint ignore:end */
	var HAS_3D =  ('WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix());
	
	var _getTranslation = function (x, y, z) {
		x = !x || $.isNumeric(x) ? (x || 0) + 'px' : x;
		y = !y || $.isNumeric(y) ? (y || 0) + 'px' : y;
		z = !z || $.isNumeric(z) ? (z || 0) + 'px' : z;
		
		var prefix = (HAS_3D ? '3d(' : '(');
		var suffix = (HAS_3D ? ',' + z + ')' : ')');
		
		return 'translate' + prefix + x + ',' + y + suffix;
	};
	
	var _getRotation = function (x, y, z, theta) {
		x = !x || $.isNumeric(x) ? (x || 0) : x;
		y = !y || $.isNumeric(y) ? (y || 0) : y;
		z = !z || $.isNumeric(z) ? (z || 0) : z;
		theta = !theta || $.isNumeric(theta) ? (theta || 0) + 'deg' : theta;
		
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
			c['-webkit-' + key] = value;
			c['-moz-' + key] = value;
			c['-ms-' + key] = value;
			c['-o-' + key] = value;
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
		return $(this).attr(DISABLED, DISABLED).addClass(DISABLED);
	};
	
	$.fn.enable = function () {
		return $(this).removeAttr(DISABLED).removeClass(DISABLED);
	};
	
})(jQuery);
/**
 * @author Deux Huit Huit
 *
 * Google Analytics wrapper
 */

(function ($) {
	'use strict';
	
	var log = function () {
		var args = [];
		$.each(arguments, function (i, a) {
			if ($.isPlainObject(a)) {
				a = JSON.stringify(a, null, 2);
			} else {
				a = '"' + a + '"';
			}
			args.push(a);
		});
		App.log({args: ['%cga(' + args.join(',') + ');', 'color:red']});
	};
	
	// ga facilitators
	$.sendPageView = function (opts) {
		var ga = window.ga || log;
		var defaults = {
			page: window.location.pathname + window.location.search,
			location: window.location.href,
			hostname: window.location.hostname
		};
		var args = !opts ? defaults : $.extend(defaults, opts);
		
		ga('send', 'pageview', args);
	};
	
	$.sendEvent = function (cat, action, label, value, options) {
		var ga = window.ga || log;
		ga('send', 'event', cat, action, label, value, options || {nonInteraction: 1});
	};
	
	$.fn.sendClickEvent = function (options) {
		options = options || {};
		var t = $(this).eq(0);
		if (!options.action) {
			options.action = 'click';
		}
		if (!options.label) {
			options.label = t.text();
		}
		var o = $.extend({}, options, {
			cat: t.attr('data-ga-cat'),
			action: t.attr('data-ga-action'),
			label: t.attr('data-ga-label'),
			value: parseInt(t.attr('data-ga-value'), 10) || undefined
		});
		if (!o.cat) {
			App.log('No ga-cat found. Cannot continue.');
			return;
		}
		if (!o.label) {
			App.log('No ga-label found. Reverting to text');
		}
		$.sendEvent(o.cat, o.action, o.label, o.value);
	};
	
	// auto-hook
	$(function () {
		$('#site').on($.click, '*[data-ga-cat]', function (e) {
			$(this).sendClickEvent();
		});
	});
	
})(jQuery);
/**
 * @author Deux Huit Huit
 * 
 */
(function ($, undefined) {
	
	'use strict';
	
	var dropdownmenu = function (opts) {
	
		
		var init = function (index) {
			
			var elem = $(this);
			
			var isPoped = false;
			
			// Create options
			var options = $.extend({}, $.dropdownmenu.defaults, {
				popup: elem.attr('data-popup'),
				items: elem.attr('data-items'),
				background: elem.attr('data-background'),
				click: $.click || 'click'
			}, opts);
			
			// Ensure we are dealing with jQuery objects
			options.popup = $(options.popup);
			options.background = $(options.background);
			options.items = options.popup.find(options.items);
			
			var showMenu = function () {
				if (!isPoped) {
					positionMenu();
					
					options.background.addClasses(options.showClass, options.popupClass);
					options.popup.addClasses(options.showClass, options.popupClass);
					isPoped = true;
					
					if ($.isFunction(options.menuPoped)) {
						options.menuPoped.call(elem, options);
					}
					
					elem.trigger('menuPoped', [options]);
				}
			};
			
			var hideMenu = function () {
				if (isPoped) {
					options.background.removeClasses(options.showClass, options.popupClass);
					options.popup.removeClasses(options.showClass, options.popupClass);
					isPoped = false;
				}
			};
			
			var positionMenu = function () {
				var tOffset = elem.offset();
				
				options.popup.css(tOffset);
			};
			
			elem.on(options.click, function elemClick(e) {
				showMenu();
				
				return window.pd(e, true);
			});
			
			options.items.on(options.click, function itemClick(e) {
				var t = $(this);
				options.items.removeClass(options.selectedClass);
				t.addClass(options.selectedClass);
				
				if ($.isFunction(options.selectionChanged)) {
					options.selectionChanged.call(elem, t, options);
				} else {
					elem.text(t.text());
				}
				
				elem.trigger('selectionChanged', [t, options]);
				
				hideMenu();
				
				//Mis en commentaire pour permettre le faire le clique sur les liens
				//return window.pd(e, true);
			});
			
			options.background.on(options.click, function bgClick(e) {
				hideMenu();
				
				return window.pd(e, true);
			});
			
			$(window).resize(function (e) {
				if (isPoped) {
					positionMenu();
				}
			});
		};
		
		return init;
	};
	
	
	$.fn.dropdownmenu = function (options) {
		var t = $(this);
		
		return t.each(dropdownmenu(options));
	};
	
	$.dropdownmenu = {
		defaults: {
			popup: null,
			items: '>*',
			background: null,
			showClass: 'show',
			popupClass: 'popup',
			selectedClass: 'selected',
			selectionChanged: null,
			menuPoped: null
		}
	};
	
})(jQuery);
/**
 * @author Deux Huit Huit
 * 
 * css3 Transition end
 */

(function ($, undefined) {
	
	'use strict'; 
	
	var transitionEndEvent = 'transitionend ' + 
		'webkitTransitionEnd oTransitionEnd mozTransitionEnd MSTransitionEnd',
	addClassTimer = 'add-class-timer',
	queue = [],
	
	_forEachSelectorsInQueue = function (fn) { 
		if (!!queue.length) {
			$.each(queue, function eachRemoveFromQueue(index, q) {
				// check q since it may be undefined
				// when the array removes it
				if (!!q) {
					// call it
					fn.call(this, q, index);
				}
			});
		}
	};
	
	if (!window.App || !!window.App.debug()) {
		$.transitionsQueue = function () {
			return queue;
		};
	}
	
	$('body').on(transitionEndEvent, function (e) {
		var target = $(e.target);
		
		_forEachSelectorsInQueue(function eachInQueue(q, index) {
			
			$.each(q.selectors, function eachCallbackSelector(selector, value) {
				q.selectors[selector] = value || target.is(selector);
			});
			
			// every selectors are on
			if (_.every(q.selectors)) {
				// remove from queue
				queue.splice(index, 1);
				// call callback
				q.callback.call(q.context, e);
			}
		});
		//console.log('transition ended for ', e.target);
	});
	
	$.fn.transitionEnd = function (callback, selectors) {
		var 
		self = $(this),
		q = {
			selectors: {},
			callback: callback,
			context: this,
			timestamp: $.now()
		};
		
		if (!!selectors && !$.isArray(selectors)) {
			selectors = [selectors];
		}
		
		if (!selectors || !selectors.length) {
			// use ourself if we can
			if (!!self.selector) {
				q.selectors[self.selector] = false;
			} else {
				if (!!App.debug()) {
					console.warn('Element %s has no selector', this);
				}
				// exit
				return self;
			}
		} else {
			$.each(selectors, function (index, value) {
				if (!!value) {
					q.selectors[value] = false;
				} else if (!!App.debug()) {
					console.warn('Element %s has no selector', index);
				}
			});
		}
		
		// add to queue
		queue.push(q);
		
		return self;
	};
	
	$.removeFromTransition = function (selectors) {
		var found = false;
		
		if (!!selectors) {
		
			if (!$.isArray(selectors)) {
				selectors = [selectors];
			}
			
			_forEachSelectorsInQueue(function eachInQueue(q, index) {
				var localFound = false;
				
				if (!!q && !!q.selectors) {
					
					var eachCallbackSelector = function (value, selector) {
						return !!~$.inArray(selector, selectors);
					};
					
					localFound = _.some(q.selectors, eachCallbackSelector);
					
					if (localFound) {
						// remove from queue
						queue.splice(index, 1);
						
						//console.log('%s at %s have been removed from queue', selectors, index);
						
						found = true;
					}
				}
			});
		}
		
		return found;
	};
	
	
	$.fn.addClasses = function (class1, class2, callback, selectors) {
		var t = $(this);
		if (!t.length) {
			return t;
		}
		selectors = selectors || [t.selector];
		return t.each(function (index, element) {
			var t = $(element), 
			timer = t.data(addClassTimer);
			
			clearTimeout(timer);
			
			t.addClass(class1);
			
			timer = setTimeout(function addClassesTimer(class2, callback, selectors) {
				// if class1 is still present
				if (t.hasClass(class1)) {
					if ($.isFunction(callback)) {
						t.transitionEnd(callback, selectors);
					}
					t.addClass(class2);
				}
			}, 100, class2, callback, selectors);
			
			t.data(addClassTimer, timer);
		});
	};

	$.fn.removeClasses = function (class1, class2, callback, selectors) {
		var t = $(this);
		if (!t.length) {
			return t;
		}
		selectors = selectors || t.selector;
		return t.each(function (index, element) {
			var t = $(element);
			t.transitionEnd(function tEnd() {
				t.removeClass(class1);
				if ($.isFunction(callback)) {
					callback();
				}
			}, selectors);
			t.removeClass(class2);
		});
	};
	
})(jQuery);
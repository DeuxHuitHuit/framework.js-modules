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
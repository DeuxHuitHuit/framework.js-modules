/*! framework.js-modules - v1.5.0 - build 356 - 2018-02-28
 * https://github.com/DeuxHuitHuit/framework.js-modules
 * Copyright (c) 2018 Deux Huit Huit (https://deuxhuithuit.com/);
 * MIT *//**
 * @author Deux Huit Huit
 */

(function ($, win, undefined) {
	
	'use strict';
	
	App.components.exports('algolia-search', function (options) {
		var ctn;
		var aClient;
		var aIndex;
		var input;
		var resultsCtn;
		var rootUrl = document.location.protocol + '//' + document.location.host;
		var lg = $('html').attr('lang');
		var searchBarInput;
		var searchTaggingTimer = 0;
		
		var createResultsTemplatingObject = function (hit) {
			return {
				title: hit.title,
				url: hit.url.replace(rootUrl, '')
			};
		};
		
		var defaultOptions = {
			inputSelector: '.js-algolia-input',
			resultsCtnSelector: '.js-algolia-results-ctn',
			resultsContentSelector: '.js-algolia-results-content',
			noResultsTemplateSelector: '.js-algolia-no-results-template',
			resultsItemTemplateSelector: '.js-algolia-results-item-template',
			algoliaAttributesToRetrieve: 'title,url,image',
			algoliaAttributesToHighlight: 'title',
			resultsTemplateStringSelector: '.js-algolia-results-template-string',
			facetsAttr: 'data-algolia-facets',
			facetFiltersAttr: 'data-algolia-facet-filters',
			onCreateResultsTemplatingObject: createResultsTemplatingObject,
			defaultResultsTemplateString: '<div><a href="__url__">__title__</a></div>',
			defaultFacets: 'lang',
			defaultFacetFilters: 'lang:' + lg,
			searchCallback: $.noop,
			clearCallback: $.noop,
			beforeSearchCallback: $.noop,
			gaCat: 'Search',
			gaAction: 'search',
			gaTimer: 1000,
			_templateSettings: {
				interpolate: /__(.+?)__/g,
				evaluate: /_%([\s\S]+?)%_/g,
				escape: /_%-([\s\S]+?)%_/g
			},
			algolia: {
				app: '',
				key: '',
				index: ''
			}
		};
		
		var o = $.extend({}, defaultOptions, options);

		var trackSearch = function (val, nb) {
			$.sendEvent(o.gaCat, o.gaAction, val, nb);
		};

		var appendNoResults = function (rCtn) {
			var resultContent = rCtn.find(o.resultsContentSelector);
			var noResults = !!rCtn.find(o.noResultsTemplateSelector).length ?
				rCtn.find(o.noResultsTemplateSelector).html() : '';
			resultContent.append(noResults);
		};
		
		var searchCallback = function (rCtn, err, content, val, appendNewResults) {
			var resultContent = rCtn.find(o.resultsContentSelector);
			
			if (!!!appendNewResults) {
				resultContent.empty();
			}

			if (!err) {
				if (!!content.nbHits) {
					var tmplString = !!rCtn.find(o.resultsItemTemplateSelector).length ?
						rCtn.find(o.resultsItemTemplateSelector).text() :
						o.defaultResultsTemplateString;
					
					var originalSettings = _.templateSettings;
					_.templateSettings = o._templateSettings;
					
					var tplt = _.template(tmplString);
					
					$.each(content.hits, function () {
						var t = this;
						
						var cleanData = o.onCreateResultsTemplatingObject(t);
						var newItem = tplt(cleanData);
						resultContent.append(newItem);
					});
					
					_.templateSettings = originalSettings;
				} else if (!!val && val.length > 2) {
					appendNoResults(rCtn);
				}
				clearTimeout(searchTaggingTimer);
				searchTaggingTimer = setTimeout(function () {
					trackSearch(val, !content ? 0 : (content.nbHits || 0));
				}, o.gaTimer);
			}
			App.callback(o.searchCallback, [rCtn, err, content, o, val]);
		};

		var search = function (pageToRetrieve, appendNewResults) {
			var val = input.val();
			var p = !!parseInt(pageToRetrieve) ? parseInt(pageToRetrieve) : 0;
			
			App.callback(o.beforeSearchCallback, [{
				resultsCtn: resultsCtn
			}]);
			
			resultsCtn.each(function () {
				var t = $(this);
				
				var facets = !!t.attr(o.facetsAttr) ?
					t.attr(o.facetsAttr) : o.defaultFacets;
				var facetFilters = !!t.attr(o.facetFiltersAttr) ?
					t.attr(o.facetFiltersAttr) : o.defaultFacetFilters;

				aIndex.search(val, {
					facets: facets,
					facetFilters: facetFilters,
					attributesToRetrieve: o.algoliaAttributesToRetrieve,
					attributesToHighlight: o.algoliaAttributesToHighlight,
					page: p
				}, function (err, content) {
					searchCallback(t, err, content, val, appendNewResults);
				});
			});
		};

		var clear = function () {
			resultsCtn.each(function () {
				var resultContent = $(this).find(o.resultsContentSelector);
				resultContent.empty();
			});
			App.callback(o.clearCallback, [resultsCtn, o]);
		};
		
		var onInputKeyUp = function () {
			var val = input.val();
		
			if (val.length > 2) {
				search();
			} else {
				clear();
			}
		};
		
		var init = function (c) {
			ctn = $(c);
			input = ctn.find(o.inputSelector);
			resultsCtn = ctn.find(o.resultsCtnSelector);
			
			// init algolia
			aClient = window.algoliasearch(o.algolia.app, o.algolia.key);
			aIndex = aClient.initIndex(o.algolia.index);
			input.on('keyup', onInputKeyUp);
		};
		
		return {
			init: init,
			search: search,
			updateInputVal: function (val) {
				input.val(val);
			},
			getVal: function () {
				return input.val();
			},
			clear: clear
		};
	});
	
})(jQuery, jQuery(window));

/**
 * @author Deux Huit Huit
 *
 * Article Changer
 *
 */
(function ($, w, doc, undefined) {

	'use strict';
	var startAnimToArticleDefault = function (current, next, o, callback) {
		if (!!current.length) {
			var ctn = current.closest(o.containerSelector);
			ctn.css({
				minHeight: current.height() + 'px'
			});
			current.fadeTo(500, 0, function () {
				current.hide();
				callback(current, next, o);
			});
		} else {
			callback(current, next, o);
		}
	};

	var endAnimToArticleDefault = function (current, next, o) {
		var ctn = next.closest(o.containerSelector);
		if (o.scrollToTop) {
			App.mediator.notify('window.scrollTop', {
				animated: false
			});
		}

		App.mediator.notify('articleChanger.entering');
		next.fadeTo(500, 1, function () {
			o.articleEnter(current, next, o);
			ctn.css({
				minHeight: ''
			});
		});
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
		startAnimToArticle: startAnimToArticleDefault,
		endAnimToArticle: endAnimToArticleDefault,
		trackHandle: true,
		twoStepAnim: false,
		scrollToTop: false,
		articleEnter: function (oldItem, newItem, o) {
			if (!o.trackHandle) {
				oldItem.remove();
			}
			App.mediator.notify('articleChanger.enter', {
				item: newItem,
				article: newItem
			});
		}
	};

	App.components.exports('articleChanger', function articleChanger () {
		var o;
		var page;
		var articleCtn;
		var currentPageHandle;
		var isLoading = false;
		var isAnimating = false;
		var loadingUrl = '';

		var checkStartAnimAnd = function (current, next, o) {
			isAnimating = false;
			if (!isLoading) {
				//Complete anim
				o.endAnimToArticle(current, next, o);
			}
		};

		var init = function (p, options) {
			page = p;
			o = $.extend({}, defOptions, options);
			articleCtn = $(o.containerSelector, page);
			currentPageHandle = o.startPageHandle;
		};

		var loadUrl = '';

		var navigateTo = function (newPageHandle, url) {
			var currentPage = o.findArticle(articleCtn, currentPageHandle, o);
			loadUrl = url || document.location.href;

			/* jshint latedef:false */
			var loadSuccess = function (dataLoaded, textStatus, jqXHR) {
				//Append New article
				isLoading = false;
				if (loadUrl === loadingUrl) {
					var nextPage = o.appendArticle(articleCtn, dataLoaded, newPageHandle, o);
					var loc = document.location;
					var cleanUrl = loc.href.substring(
						loc.hostname.length +
						loc.protocol.length + 2
					);
					
					App.mediator.notify('pageLoad.end');
					App.mediator.notify('articleChanger.loaded', {url: cleanUrl, data: dataLoaded});
					
					if (!nextPage.length) {
						App.log({
							args: 'Could not find new article',
							fx: 'error',
							me: 'Article Changer'
						});
					} else {
						if (o.twoStepAnim && !isAnimating) {
							o.endAnimToArticle(currentPage, nextPage, o);
						} else {
							o.startAnimToArticle(currentPage, nextPage, o, checkStartAnimAnd);
						}
					}
				} else {
					//Launch again loading
					load();
				}
			};

			var load = function () {
				if (!isLoading) {
					App.mediator.notify('pageLoad.start', {page: page});
					isLoading = true;
					loadingUrl = loadUrl;

					Loader.load({
						url: loadUrl,
						priority: 0, // now
						vip: true, // bypass others
						success: loadSuccess,
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
							App.mediator.notify('article.loaderror');
							App.mediator.notify('pageLoad.end');
							isLoading = false;
						},
						giveup: function (e) {
							App.mediator.notify('pageLoad.end');
							isLoading = false;
						}
					});
				}
			};
			/* jshint latedef:true */

			if (!o.trackHandle || currentPageHandle !== newPageHandle) {
				
				var nextPage;
				if (o.trackHandle) {
					nextPage = o.findArticle(articleCtn, newPageHandle, o);
				}
				
				// LoadPage
				if (!nextPage || !nextPage.length) {
					if (o.twoStepAnim) {
						isAnimating = true;
						o.startAnimToArticle(currentPage, nextPage, o, checkStartAnimAnd);
					}
					load();
				} else {
					o.startAnimToArticle(currentPage, nextPage, o, checkStartAnimAnd);
				}
				
				currentPageHandle = newPageHandle;
			}
		};
		
		return {
			init: init,
			clear: function () {
				currentPageHandle = '';
			},
			navigateTo: navigateTo
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

	var animToArticleDefault = function (current, next, o) {
		

		if (!!current.length) {
			var ctn = current.closest(o.containerSelector);
			ctn.css({
				minHeight: current.height() + 'px'
			});
			
			current.fadeTo(500, 0, function () {
				current.hide();

				if (o.scrollToTop) {
					App.mediator.notify('window.scrollTop', {
						animated: false
					});
				}

				App.mediator.notify('articleChanger.entering', {
					article: next,
					ctn: ctn
				});
				
				next.fadeTo(500, 1, function () {
					ctn.css({
						minHeight: ''
					});
				});
				
				setTimeout(function () {
					o.articleEnter(current, next, o);
				}, 100);
			});
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
		scrollToTop: false,
		articleEnter: function (oldItem, newItem, o) {
			if (!o.trackHandle) {
				oldItem.remove();
			}
			App.mediator.notify('articleChanger.enter', {
				article: newItem
			});
		}
	};
	
	App.components.exports('articleChanger', function articleChanger () {
		var o;
		var page;
		var articleCtn;
		var currentPageHandle;
		
		var init = function (p, options) {
			page = p;
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
				
				App.mediator.notify('pageLoad.end');
				App.mediator.notify('articleChanger.loaded', {
					url: cleanUrl,
					data: dataLoaded
				});
				
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
					App.mediator.notify('pageLoad.start', {page: page});
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
							App.mediator.notify('article.loaderror');
							App.mediator.notify('pageLoad.end');
						},
						giveup: function (e) {
							App.mediator.notify('pageLoad.end');
						}
					});
					
				} else {
					o.animToArticle(currentPage, nextPage, o);
				}
				
				currentPageHandle = newPageHandle;
			}
		};
		
		return {
			init: init,
			clear: function () {
				currentPageHandle = '';
			},
			navigateTo: navigateTo
		};
	
	});
	
})(jQuery, window, document);

/**
 * @author Deux Huit Huit
 *
 * Checkpoint event
 *  Sends a analytic event when a certain gate is reached.
 */

(function ($, win, undefined) {

	'use strict';

	var defaults = {
		checkPoints: [0, 25, 50, 75, 90, 100],
		category: 'Scroll',
		action: 'scroll'
	};
	var body = $('body');

	App.components.exports('checkpoint-event', function (options) {
		var o = $.extend({}, defaults, options);
		var gate = 0;

		var track = function (perc) {
			if ($.isNumeric(o.checkPoints[gate]) &&
				$.isNumeric(perc) && o.checkPoints[gate] <= perc) {
				var action = o.action + ' ' + o.checkPoints[gate] + '%';
				var label = o.label || action;
				$.sendEvent(o.category, action, label, o.checkPoints[gate]);
				gate++;
			}
		};
		
		var reset = function () {
			gate = 0;
		};
		
		var init = function () {
			reset();
		};
		
		return {
			init: init,
			track: track,
			reset: reset
		};
	});

})(jQuery, jQuery(window));

/**
 * @author Deux Huit Huit
 *
 *	Flickity component
 */

(function ($, win, undefined) {

	'use strict';

	App.components.exports('flickity', function (options) {
		var slider = $();
		var scope = $();
		var isInited = false;

		var defaultOptions = {
			sliderCtn: '.js-flickity-slider-ctn',
			cellSelector: '.js-flickity-cell',
			navBtnSelector: '.js-flickity-nav-btn',

			abortedClass: 'is-flickity-cancelled',
			initedClass: 'is-flickity-inited',
			selectedClass: 'is-selected',
			seenClass: 'is-seen',

			dataAttrPrefix: 'flickity'
		};

		var o = $.extend({}, defaultOptions, options);

		var flickityOptions = function () {
			var opts = {};
			var dataAttrPattern = new RegExp('^' + o.dataAttrPrefix);
			opts = _.reduce(slider.data(), function (memo, value, key) {
				if (dataAttrPattern.test(key)) {
					if (_.isObject(value)) {
						return memo;
					}
					var parsedKey = key.replace(dataAttrPattern, '');
					var validKey = '';
					if (!!parsedKey && !!parsedKey[0]) {
						validKey = parsedKey[0].toLowerCase();
						if (parsedKey.length >= 2) {
							validKey += parsedKey.substr(1);
						}
						memo[validKey] = value;
					}
				}
				return memo;
			}, {});
			return $.extend({}, o, opts);
		};

		var resize = function () {
			slider.flickity('resize');
		};

		var setActiveSlideSeen = function () {
			var currentSlide = slider.data('flickity').selectedIndex;

			slider.find(o.cellSelector + ':eq(' + currentSlide + ')').addClass(o.seenClass);

			slider.find(o.cellSelector + '.' + o.seenClass).each(function () {
				slider.find('.flickity-page-dots li:eq(' + $(this).index() + ')')
					.addClass(o.seenClass);
			});

		};
		
		var init = function (item, s) {
			slider = item;
			scope = s;

			if (slider.find(o.cellSelector).length > 1) {

				var flickOptions = flickityOptions();

				slider.flickity(flickOptions);
				slider.flickity('resize');
				slider.addClass(o.initedClass);
				isInited = true;

				if (!!flickOptions.pageDots) {
					slider.on('settle.flickity', setActiveSlideSeen);
				}
				slider.find('img[data-src-format]').jitImage();
				App.callback(o.inited);
			} else if (slider.find(o.cellSelector.length == 1)) {
				slider.addClass(o.abortedClass);
				slider.find(o.cellSelector).addClass(o.selectedClass);
				App.callback(o.aborted);
			}
		};

		var destroy = function () {
			if (slider.hasClass(o.initedClass) && slider.closest('body').length > 0) {
				slider.flickity('destroy');
				slider.removeClass(o.initedClass);
				slider.off('settle.flickity', setActiveSlideSeen);
				slider = $();
				App.callback(o.destroyed);
			}
		};

		return {
			init: init,
			resize: resize,
			destroy: destroy,
			isInited: function () {
				return isInited;
			}
		};
	});

})(jQuery, jQuery(window));

/**
 * @author Deux Huit Huit
 *
 *  Form Field
 *
 *  Moment file : https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.0/moment.min.js
 */
(function ($, w, doc, moment, undefined) {

	'use strict';

	var defaults = {
		container: '.js-form-field',
		input: '.js-form-input',
		error: '.js-form-error',
		label: '.js-form-label',
		states: '.js-form-state',
		clear: '.js-form-clear',
		preview: '.js-form-preview',
		progress: '.js-form-progress',
		validationEvents: 'blur change',
		emptinessEvents: 'blur keyup change',
		previewEvents: 'change input',
		formatEvents: 'blur',
		changeLabelTextToFilename: true,
		onlyShowFirstError: false,
		group: null,
		rules: {
			required: {
				presence: true
			},
			email: {
				email: true
			},
			money: {
				numericality: {
					onlyInteger: false,
					greaterThan: 0
				}
			},
			integer: {
				numericality: {
					onlyInteger: true,
					greaterThan: 0
				}
			},
			document: {
				format: {
					pattern: '^.+\\.(?:docx?|pdf)$',
					flags: 'i'
				}
			},
			image: {
				format: {
					pattern: '^.+\\.(?:jpe?g|png)$',
					flags: 'i'
				}
			},
			phoneUs: {
				format: {
					pattern: '\\(?[0-9]{3}\\)?[- ]?([0-9]{3})[- ]?([0-9]{4})',
					flags: 'i'
				}
			},
			url: {
				url: true
			},
			embed: {
				format: {
					pattern: '^http(.+)(youtube\\.com|youtu\\.be|vimeo\\.com|facebook\\.com)(.+)$',
					flags: 'i'
				}
			}
		},
		rulesOptions: {
			
		},
		formatters: {
			
		}
	};
	
	var extendedDateRules = null;

	if (window.moment) {
		extendedDateRules = {
			rules: {
				over18Now: {
					datetime: {
						dateOnly: true,
						earliest: window.moment.utc().subtract(150, 'years'),
						latest: window.moment.utc().subtract(18, 'years')
					}
				}
			}
		};
	} else {
		App.log('com::form-field: Extended date rules are not available.' +
			' Add Moment.js to enable them.');
	}

	App.components.exports('form-field', function formField (options) {
		var ctn;
		var input;
		var error;
		var label;
		var states;
		var clear;
		var progress;
		var rules = [];
		var self;

		options = $.extend(true, {}, defaults, extendedDateRules, options);

		var getStateClasses = function (t) {
			return {
				error: t.attr('data-error-class'),
				valid: t.attr('data-valid-class'),
				empty: t.attr('data-empty-class'),
				notEmpty: t.attr('data-not-empty-class'),
				submitting: t.attr('data-submitting-class')
			};
		};
		
		var getStateClass = function (state) {
			return state.attr('data-state-class');
		};
		
		var setStateClass = function (fx, s) {
			var state = states.filter('[data-state="' + s + '"]');
			state[fx](getStateClass(state));
		};
		
		var enable = function (enable) {
			if (enable) {
				input.enable();
			}
			else {
				input.disable();
			}
		};
		
		var focus = function () {
			input.focus();
		};
		
		var previewFile = function (ctn, file) {
			ctn.empty();
			//Change label caption
			if (options.changeLabelTextToFilename) {
				if (!!file && file.name) {
					label.text(file.name);
				} else {
					label.text(label.attr('data-text'));
				}
			}

			if (!!file && !!w.FileReader) {
				var reader = new w.FileReader();
				reader.onload = function readerLoaded (event) {
					var r = event.target.result;
					if (!!r) {
						var img = $('<img />')
							.attr('class', ctn.attr('data-preview-class'))
							.attr('src', r)
							.on('error', function () {
								img.remove();
							});
						ctn.append(img);
					}
				};
				reader.readAsDataURL(file);
			}
		};

		var reset = function () {
			var inputClasses = getStateClasses(input);
			var ctnClasses = getStateClasses(ctn);
			var labelClasses = getStateClasses(label);
			input.removeClass(inputClasses.error);
			input.removeClass(inputClasses.valid);
			input.addClass(inputClasses.empty);
			input.removeClass(inputClasses.notEmpty);
			ctn.removeClass(ctnClasses.error);
			ctn.removeClass(ctnClasses.valid);
			ctn.addClass(ctnClasses.empty);
			ctn.removeClass(ctnClasses.notEmpty);
			label.removeClass(labelClasses.error);
			label.removeClass(labelClasses.valid);
			label.addClass(labelClasses.empty);
			label.removeClass(labelClasses.notEmpty);
			error.empty().removeClass(getStateClass(error));
			setStateClass('removeClass', 'error');
			setStateClass('removeClass', 'valid');

			if (input.attr('type') == 'file') {
				if (options.changeLabelTextToFilename) {
					label.text(label.attr('data-text'));
				}

				//Reset preview
				previewFile(ctn.find(options.preview), null);
			}
		};

		var value = function () {
			var value;
			if (input.attr('type') == 'checkbox') {
				value = input.prop('checked') ? 'true' : '';
			} else if (input.attr('type') == 'radio') {
				//Get grouped item
				var goodInput = input.closest('form').
					find('input[type=\'radio\'][name=\'' + input.attr('name') + '\']:checked');
				if (!!goodInput.length) {
					value = goodInput.prop('checked') ? goodInput.val() : '';
				} else {
					value = input.prop('checked') ? input.val() : '';
				}
			} else if (input.hasClass('js-form-field-radio-list')) {
				var selectedInput = input.find('input[type=\'radio\']:checked');
				value = selectedInput.prop('checked') ? selectedInput.val() : '';
			} else {
				value = input.val();
			}
			return value;
		};

		var checkEmptiness = function () {
			var valueIsEmpty = w.validate.isEmpty(value());
			var emptyFx = valueIsEmpty ? 'addClass' : 'removeClass';
			var notEmptyFx = valueIsEmpty ? 'removeClass' : 'addClass';
			var inputClasses = getStateClasses(input);
			var ctnClasses = getStateClasses(ctn);
			var labelClasses = getStateClasses(label);
			input[emptyFx](inputClasses.empty);
			input[notEmptyFx](inputClasses.notEmpty);
			ctn[emptyFx](ctnClasses.empty);
			ctn[notEmptyFx](ctnClasses.notEmpty);
			label[emptyFx](labelClasses.empty);
			label[notEmptyFx](labelClasses.notEmpty);
		};
		
		var preview = function (e) {
			var p = ctn.find(options.preview);
			if (input.attr('type') == 'file') {
				checkEmptiness();
				if (!!p.length) {
					var file = !!e && !!e.target.files && e.target.files[0];
					file = file || (input[0].files && input[0].files[0]);
					previewFile(p, file);
				}
			}
		};
		
		var tryValidate = function (value) {
			try {
				var constraints = {};
				var rulesOptions = {};
				_.each(rules, function (rule) {
					if (!!options.rules[rule]) {
						constraints = $.extend(constraints, options.rules[rule]);
					}
					if (!!options.rulesOptions[rule]) {
						rulesOptions = $.extend(rulesOptions, options.rulesOptions[rule]);
					}
				});
				
				return w.validate.single(value, constraints, rulesOptions);
			}
			catch (ex) {
				App.log({fx: 'error', args: [ex]});
			}
			return false;
		};
		
		var format = function () {
			_.each(rules, function (rule) {
				if (!!options.formatters[rule]) {
					options.formatters[rule](input, self);
				}
			});
		};
		
		var validate = function () {
			var result = tryValidate(value());
			
			var errorFx = !result ? 'removeClass' : 'addClass';
			var validFx = !result ? 'addClass' : 'removeClass';
			var errorMessages = !result ? '' :
				(options.onlyShowFirstError ? result[0] : result.join('<br />'));
			var inputClasses = getStateClasses(input);
			var ctnClasses = getStateClasses(ctn);
			var labelClasses = getStateClasses(label);
			
			input[errorFx](inputClasses.error);
			input[validFx](inputClasses.valid);
			
			ctn[errorFx](ctnClasses.error);
			ctn[validFx](ctnClasses.valid);
			
			label[errorFx](labelClasses.error);
			label[validFx](labelClasses.valid);
			
			error.html(errorMessages);
			
			if (!result) {
				// valid!
				error.removeClass(getStateClass(error));
				setStateClass('addClass', 'valid');
				setStateClass('removeClass', 'error');
				return result;
			}
			error.addClass(getStateClass(error));
			setStateClass('addClass', 'error');
			setStateClass('removeClass', 'valid');
			return {
				result: result,
				field: self
			};
		};
		
		var submitting = function (submitting) {
			var submittingFx = submitting ? 'addClass' : 'removeClass';
			var inputClasses = getStateClasses(input);
			input[submittingFx](inputClasses.submitting);
		};
		
		var init = function (o) {
			options = $.extend(true, options, o);
			ctn = $(options.container);
			input = ctn.find(options.input);
			error = ctn.find(options.error);
			label = ctn.find(options.label);
			states = ctn.find(options.states);
			clear = ctn.find(options.clear);
			progress = ctn.find(options.progress);
			rules = _.filter((ctn.attr('data-rules') || '').split(/[|,\s]/g));

			if (!!options.formatEvents) {
				input.on(options.formatEvents, format);
			}
			if (!!options.validationEvents) {
				input.on(options.validationEvents, validate);
			}
			if (!!options.emptinessEvents) {
				input.on(options.emptinessEvents, checkEmptiness);
			}
			if (!!options.previewEvents) {
				input.on(options.previewEvents, preview);
			}
			if (!!ctn.find('[selected]').length) {
				checkEmptiness();
			}
		};
		
		self = {
			init: init,
			validate: validate,
			format: format,
			enable: enable,
			focus: focus,
			reset: reset,
			preview: preview,
			checkEmptiness: checkEmptiness,
			group: function () {
				return options.group;
			},
			submitting: submitting,
			value: value,
			name: function () {
				return input.attr('name');
			},
			label: function () {
				return label.text();
			},
			find: function (sel) {
				if (ctn.is(sel)) {
					return ctn;
				}
				return ctn.find(sel);
			},
			hasClass: function (cla) {
				return ctn.hasClass(cla);
			},
			required: function () {
				return !!~rules.indexOf('required');
			}
		};
		return self;
	});
	
})(jQuery, window, document, window.moment);

/**
 * @author Deux Huit Huit
 *
 * Form
 *
 */
(function ($, w, doc, moment, undefined) {

	'use strict';
	
	var defaults = {
		root: 'body',
		container: '.js-form',
		fields: '.js-form-field',
		fieldsGroupSelector: '.js-form-field-group',
		fieldsOptions: {
			
		},
		onSubmit: null,
		doSubmit: null,
		onValid: null,
		onError: null,
		disableOnSubmit: true,
		focusOnError: true,
		post: {
			
		},
		gaCat: 'conversion',
		gaLabel: 'form'
	};
	
	App.components.exports('form', function form (options) {
		var ctn;
		var validator;
		var fields = [];
		var isSubmitting = false;
		options = $.extend(true, {}, defaults, options);
		
		var track = function (action, label, value) {
			var cat = ctn.attr('data-ga-form-cat') || options.gaCat;
			label = label || ctn.attr('data-ga-form-label') || options.gaLabel;
			$.sendEvent('conversion', action, label, value);
		};
		
		var reset = function () {
			ctn[0].reset();
			_.each(fields, function (f) {
				f.reset();
			});
		};
		
		var preview = function () {
			_.each(fields, function (f) {
				f.preview();
			});
		};
		
		var validate = function () {
			return _.map(fields, function (f) {
				return f.validate();
			});
		};
		
		var isValid = function (results) {
			results = results || validate();
			return (!!results.length && !_.some(results)) || !results.length;
		};
		
		var validateGroup = function (group) {
			var groupFields = [];

			$.each(fields, function () {
				if (this.group().is(group)) {
					groupFields.push(this);
				}
			});

			return isValid(_.map(groupFields, function (f) {
				return f.validate();
			}));
		};
		
		var enable = function (enabl) {
			_.each(fields, function (f) {
				f.enable(enabl);
			});
		};
		
		var submitting = function (submitting) {
			_.each(fields, function (f) {
				f.submitting(submitting);
			});
		};
		
		var post = function () {
			var data = {};
			var processData = !window.FormData;
			
			if (isSubmitting) {
				return;
			}
			
			if (!processData) {
				data = new FormData(ctn[0]);
			}
			else {
				$.each(ctn.serializeArray(), function () {
					data[this.name] = this.value;
				});
			}
			
			isSubmitting = true;
			submitting(isSubmitting);
			App.callback(options.post.submitting);
			
			window.Loader.load({
				url: ctn.attr('action'),
				type: ctn.attr('method') || 'POST',
				data: data,
				processData: processData,
				contentType: false,
				dataType: 'text',
				error: options.post.error,
				success: options.post.success,
				complete: function () {
					App.callback(options.post.complete);
					isSubmitting = false;
					submitting(isSubmitting);
					if (options.disableOnSubmit) {
						enable(true);
					}
				}
			});
		};
		
		var isAllFieldsValid = function () {
			var isValid = true;
			_.reduce(fields, function (memo, current) {
				if (!!memo) {
					isValid = current.isValid();
					return isValid;
				}
			}, true);
			
			return isValid;
		};
		
		var onSubmit = function (e) {
			var results = validate();
			App.callback(options.onSubmit);
			
			if (isValid(results)) {
				App.callback(options.onValid);
				if (!!options.post) {
					post();
				} else {
					App.callback(options.doSubmit);
				}
				
				if (options.disableOnSubmit) {
					enable(false);
				}
				
				if (!!options.post || !!options.doSubmit) {
					return w.pd(e);
				}
			}
			else {
				App.callback(options.onError, {
					results: results
				});
				if (options.focusOnError) {
					results = _.filter(results);
					if (!!results.length) {
						results[0].field.focus();
					}
				}
				
				return w.pd(e);
			}
		};
		
		var initField = function (i, t) {
			t = $(t);
			var field = App.components.create('form-field', options.fieldsOptions);

			var showFirstErrorOnly = t.filter('[data-only-show-first-error]').length === 1;

			field.init({
				container: t,
				group: t.closest(options.fieldsGroupSelector),
				onlyShowFirstError: showFirstErrorOnly
			});
			fields.push(field);
		};
		
		var init = function (o) {
			options = $.extend(true, options, o);
			options.root = $(options.root);
			ctn = options.root.find(options.container);
			ctn.find(options.fields).each(initField);
			ctn.submit(onSubmit);
			
			if (!!options.focusOnFirst) {
				setTimeout(function () {
					fields[0].focus();
				}, 100);
			}
			
			// Default validators message
			w.validate.validators.presence.options = {
				message: ctn.attr('data-msg-required')
			};
			w.validate.validators.email.options = {
				message: ctn.attr('data-msg-email-invalid') || ctn.attr('data-msg-invalid')
			};
			w.validate.validators.format.options = {
				message: ctn.attr('data-msg-invalid')
			};
			w.validate.validators.numericality.options = {
				message: ctn.attr('data-msg-invalid')
			};
			w.validate.validators.url.options = {
				message: ctn.attr('data-msg-invalid')
			};
			var dateFormat = 'DD-MM-YYYY';

			if (!!window.moment) {
				w.validate.extend(w.validate.validators.datetime, {
					// must return a millisecond timestamp
					// also used to parse earlier and latest options
					parse: function (value, options) {
						if (!value) {
							return NaN;
						}
						if (moment.isMoment(value)) {
							return +value;
						}
						if (/[^\d-\/]/.test(value)) {
							return NaN;
						}
						var date = moment.utc(value, dateFormat);
						if (!date.isValid()) {
							return NaN;
						}
						// coerce to ms timestamp
						return +date;
					},
					// must return a string
					format: function (value, options) {
						if (!moment.isMoment(value)) {
							value = moment(value);
						}
						return value.format(dateFormat);
					},
					message: ctn.attr('data-msg-date-invalid') || ctn.attr('data-msg-invalid'),
					notValid: ctn.attr('data-msg-date-invalid') || ctn.attr('data-msg-invalid'),
					tooEarly: ctn.attr('data-msg-date-too-early') || ctn.attr('data-msg-invalid'),
					tooLate: ctn.attr('data-msg-date-too-late') || ctn.attr('data-msg-invalid')
				});
			}
		};
		
		return {
			init: init,
			enable: enable,
			validate: validate,
			reset: reset,
			preview: preview,
			post: post,
			submitting: submitting,
			validateGroup: validateGroup,
			container: function () {
				return ctn;
			},
			eachFields: function (cb) {
				return _.each(fields, cb);
			},
			getOptions: function () {
				return options;
			},
			isValid: isAllFieldsValid,
			validators: function () {
				return w.validate.validators;
			},
			track: track
		};
	});
	
})(jQuery, window, document, window.moment);

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
		
		var closeAllPopup = function () {
			if (!!openedMarker) {
				openedMarker.infowindow.close();
			}
		};
		
		var defaultMapOptions = {
			defaultMarkerOptions: {},
			mapTypeId: null,
			markerAction: function () {
				var reelPosition = new google.maps.LatLng(
					this.getPosition().lat() + 0.005,
					this.getPosition().lng());
				map.panTo(reelPosition);
				
				closeAllPopup();
				this.infowindow.open(map, this);
				openedMarker = this;
			},
			beforeCreate: null,
			afterCreate: null
		};
		
		var mapOptions = $.extend({}, defaultMapOptions, o);
		
		var addMarker = function (o) {
			
			var markerOption = $.extend({}, mapOptions.defaultMarkerOptions, o);
			
			if (markerOption.iconImage) {
				markerOption.iconImage = new google.maps.MarkerImage(
					markerOption.iconImage.src,
					new google.maps.Size(
						markerOption.iconImage.size.width,
						markerOption.iconImage.size.height
					),
					new google.maps.Point(
						markerOption.iconImage.p1.x,
						markerOption.iconImage.p1.y
					),
					new google.maps.Point(
						markerOption.iconImage.p2.x,
						markerOption.iconImage.p2.y
					)
				);
			}
			if (markerOption.position) {
				markerOption.LatLng = new google.maps.LatLng(
					markerOption.position.latitude,
					markerOption.position.longitude
				);
			}
			
			var marker = new google.maps.Marker({
				position: markerOption.LatLng,
				map: map,
				icon: markerOption.iconImage,
				shadow: markerOption.iconShadow,
				zIndex: markerOption.zIndex
			});
			
			markers.push(marker);
			
			//If we have content add the infoWindow
			if (markerOption.content && markerOption.content.length) {
				marker.infowindow = new google.maps.InfoWindow({
					content: markerOption.content
				});
				
				google.maps.event.addListener(marker, 'click', mapOptions.markerAction);
			} else if (mapOptions.markerCustomAction) {
				google.maps.event.addListener(marker, 'click', mapOptions.markerCustomAction);
			}
		};
		
		var createMap = function () {
			App.callback(mapOptions.beforeCreate, [google.maps, mapOptions, container]);
			
			if (mapOptions.center) {
				mapOptions.center = new google.maps.LatLng(
					mapOptions.center.latitude,
					mapOptions.center.longitude
				);
			}
			if (!!google.maps.MapTypeId[mapOptions.mapTypeId]) {
				mapOptions.mapTypeId = google.maps.MapTypeId[mapOptions.mapTypeId];
			}
			else {
				mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
			}
			map = new google.maps.Map(container.get(0), mapOptions);
			
			google.maps.event.addListener(map, 'bounds_changed', function () {
				//notify page that bounds changed
				App.mediator.notifyCurrentPage('map.boundsChanged', map.getBounds());
			});
			
			App.callback(mapOptions.afterCreate, [google.maps]);
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
		
		var init = function (p, selector) {
			container = $(selector, p);
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
			zoom: function (value) {
				map.setZoom(value);
			},
			fitBounds: function (viewport) {
				map.fitBounds(new google.maps.LatLngBounds(
					viewport.southwest, viewport.northeast
				));
			},
			closeAllPopup: closeAllPopup
		};
	});
	
})(jQuery, jQuery(window), window);

/**
 * @author Deux Huit Huit
 */

(function ($, win, undefined) {

	'use strict';

	App.components.exports('infinite-scroll', function (options) {
		var win = $(window);
		var scope;
		var ctn;
		var winH = win.height();
		
		var defaultOptions = {
			ctnSelector: '.js-infinite-scroll-ctn',
			contentCtnSelector: '.js-infinite-scroll-content',
			pagerLinkSelector: '.js-infinite-scroll-pager-link',
			triggerPercentage: 0.5,
			callback: $.noop
		};

		var o = $.extend({}, defaultOptions, options);

		var appendNextPage = function (dataLoaded, textStatus, jqXHR) {
			//Find a contentCtn
			var contentCtn = ctn.find(o.contentCtnSelector);
			var newContent = $(dataLoaded);

			//append new content
			if (!!contentCtn.length) {
				contentCtn.append(newContent.find(o.contentCtnSelector + ' > *'));
			} else {
				ctn.append(newContent.find(o.ctnSelector + ' > *'));
			}

			//Jit image
			ctn.find('img[data-src-format]').jitImage();
		};
		
		var loadNextPage = function (callback) {
			if (ctn.length) {
				var pagerLink = ctn.find(o.pagerLinkSelector);

				if (pagerLink.length) {
					var url = pagerLink.attr('href');

					//Remove Link
					pagerLink.remove();
					App.mediator.notify('pageLoad.start');

					window.Loader.load({
						url: url,
						success: function (dataLoaded, textStatus, jqXHR) {
							appendNextPage(dataLoaded, textStatus, jqXHR);
							
							App.modules.notify('page.replaceState', {
								title: document.title,
								url: url
							});

							App.mediator.notify('infiniteScroll.pageLoaded', {
								data: dataLoaded,
								ctn: ctn,
								url: url
							});
							App.callback(callback, [ctn, url, dataLoaded, textStatus, jqXHR, o]);

							App.mediator.notify('pageLoad.end');
						},
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
							App.mediator.notify('pageLoad.end');
						},
						giveup: function (e) {
							App.mediator.notify('pageLoad.end');
						}
					});
				}
			}
		};

		var onResize = function () {
			winH = win.height();
		};
		
		var onScroll = function () {
			winH = win.height();
			if (ctn.length) {
				var y = win.scrollTop();
				
				//y of the bottom of the container
				//relative to the bottom of the screen;
				var relY = (y - (ctn.offset().top + ctn.height()) + winH);
				var relP = relY / winH;

				if (relP >= -o.triggerPercentage && relP <= 1) {
					loadNextPage(o.callback);
				}
			}
		};

		var loadNextPageEvent = function (key, data) {
			loadNextPage(data.callback);
		};

		var init = function (s, options) {
			o = $.extend(o, options);
			scope = s;
			ctn = scope.find(o.ctnSelector);
		};

		return {
			init: init,
			resize: onResize,
			scroll: onScroll,
			loadNextPage: loadNextPageEvent
		};
	});

})(jQuery, jQuery(window));

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
		
		var resizeVideo = function (playerCtn) {
			var ctnWidth = playerCtn.width();
			var ctnHeight = playerCtn.height();
			var player = playerCtn.find(options.playerSelector);
			
			var newSize = $.sizing.aspectFill({
				width: ctnWidth,
				height: ctnHeight,
				preferWidth: false
			}, options.width / options.height);
			
			//Round size to avoid part of pixel
			newSize.height = Math.ceil(newSize.height);
			newSize.width = Math.ceil(newSize.width);
			
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
				solution: 'html',
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
		
		var loadAllVideo = function () {
			var playerCtn = container.find(options.playerContainerSelector);
			
			playerCtn.each(function () {
				var ctn = $(this);
				loadVideo(ctn);
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
		
		var setVolume = function (playerCtn, volume) {
			var player = playerCtn.find(options.playerSelector);
			
			player.jPlayer('volume', volume);
		};
		
		// c délimite ou je veux écouté mes évenement
		// (page ou site, ce qui a été spécifier lors du init)
		var init = function (c) {
			container = $(c);
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
			resizeAllVideo: resizeAllVideo,
			setVolume: setVolume
		};
	});
	
})(jQuery, jQuery(window));

/**
 * @author Deux Huit Huit
 *
 * oEmbed module
 *  Component that abstract how we need to embed media coming from
 *  a oembed sources.
 *
 *  Providers must be registered via the oembed.providers.register action
 *
 *  requires checkpoint-event
 */

(function ($, win, undefined) {

	'use strict';

	var	abstractProvider = {
		embed: function (container, id) {
			var iAutoPlayParsed = parseInt(container.attr('data-autoplay'), 10);
			var iLoopParsed = parseInt(container.attr('data-loop'), 10);
			
			var iRelatedVideo = container.attr('data-rel') === '1' ? 1 : 0;
			var extra = container.attr('data-extra');
			var iframe = this.getIframe(id, iAutoPlayParsed, iLoopParsed, iRelatedVideo, extra);
			
			iframe.attr('width', '100%');
			iframe.attr('height', '100%');
			iframe.attr('frameborder', '0');
			iframe.attr('class', container.attr('data-player-class'));
			container.append(iframe);
			return iframe;
		},
		getIframe: function (id) {
			return $('<iframe allowfullscreen="" />');
		},
		getTemplateContent: function (container) {
			var content = container.find('script');
			return _.map(content.contents(), function (e) {
				return $(e).text();
			}).join('');
		},
		play: $.noop,
		pause: $.noop,
		ready: $.noop,
		progress: $.noop,
		volume: $.noop,
		finish: $.noop,
		destroy: function (element) {
			element.remove();
		}
	};
	
	var providers = {
		abstractProvider: abstractProvider
	};
	
	var oembedCom = App.components.exports('oembed', function (options) {
		var container = $(options.container);
		var player = $(options.player);
		var oembedId = player.data('oembedId');
		var oembedProviderName = player.data('oembedProvider');
		var oembedProvider = providers[oembedProviderName];
		var embededElement = $();
		
		if (!oembedProvider) {
			App.log({args: ['Provider `%s` not found.', oembedProvider], me: 'oEmbed', fx: 'warn'});
			oembedProvider = abstractProvider;
		}
		
		var load = function (params) {
			params = params || false;
			
			embededElement = oembedProvider.embed(player, oembedId, params.autoplay, params.loop);
			embededElement = embededElement || $();
			
			// Track it
			var checkpointEvent = App.components.create('checkpoint-event', {
				category: options.category || 'Video',
				action: 'view',
				label: oembedProviderName + ': ' + (player.attr('data-oembed-title') || oembedId)
			});
			checkpointEvent.init();
			oembedProvider.ready(player, function () {
				player.addClass('loaded');
				
				oembedProvider.progress(player, function (perc) {
					checkpointEvent.track(perc);
				});
				
				if (!!params.finish) {
					oembedProvider.finish(player, params.finish);
				}
			});
		};
		
		var setVolume = function (volume) {
			oembedProvider.volume(player, volume);
		};
		
		var play = function () {
			oembedProvider.play(container);
		};
		
		var pause = function () {
			if (!!oembedProvider &&
				!!oembedId &&
				!!container.find('iframe').length) {
				oembedProvider.pause(container);
			}
		};
		
		var destroy = function () {
			player.removeClass('loaded');
			oembedProvider.destroy(embededElement);
		};
		
		return {
			load: load,
			play: play,
			pause: pause,
			volume: setVolume,
			destroy: destroy
		};
	});
	
	var oembedMod = App.modules.exports('oembed-providers', {
		actions: function () {
			return {
				oembed: {
					providers: {
						abstract: function () {
							return abstractProvider;
						},
						register: function (key, data) {
							if (!!providers[data.key]) {
								App.log({
									args: ['Provider `%s` already exists.', data.key],
									me: 'oEmbed',
									fx: 'error'
								});
							}
							else {
								providers[data.key] = data.provider;
							}
						}
					}
				}
			};
		}
	});
	
})(jQuery, jQuery(window));

/**
 * @author Deux Huit Huit
 *
 * replace history state on scroll
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var win = $(window);
	var defaults = {
		itemSelector: '.js-replace-state-on-scroll',
		container: 'body',
		urlAttribute: 'data-canonical-url',
		titleAttribute: 'data-canonical-title',
		change: null,
		windowOffsetPercentage: 0.5
	};
	
	var ReplaceStateOnScroll = App.components.exports(
		'replace-state-on-scroll', function (options) {
		var o = $.extend({}, defaults, options);
		var items = $();
		var datum = [];
		var cur = -1;
		var winHeight = win.height();
		var seen = -1;
		
		var reset = function () {
			seen = -1;
			cur = -1;
		};
		
		var update = function () {
			winHeight = win.height();
			items = $(o.container).find(o.itemSelector);
			datum = _.map(items, function (i) {
				i = $(i);
				return {
					offset: i.offset(),
					url: i.attr(o.urlAttribute),
					title: i.attr(o.titleAttribute)
				};
			});
		};
		
		var init = function (options) {
			o = $.extend(o, options);
			reset();
			update();
		};
		
		var scroll = function () {
			var top = win.scrollTop();
			var n = _.findLastIndex(datum, function (data) {
				return data.offset.top + winHeight * o.windowOffsetPercentage <= top;
			});
			if (n === -1) {
				return;
			}
			if (cur !== n && !!datum[n]) {
				var url = datum[n].url;
				var title = datum[n].title;
				if (!!title) {
					document.title = title;
				}
				if (!!url) {
					App.modules.notify('page.replaceState', {
						title: title || document.title,
						url: url
					});
					

					App.callback(o.change, [cur, n, url]);
					if (n > seen) {
						$.sendPageView({page: url});
					}
				}
				cur = n;
				seen = Math.max(seen, n);
			}
		};
		
		return {
			init: init,
			scroll: scroll,
			update: update,
			reset: reset
		};
	});
	
})(jQuery, window);

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
			prefixAgo: 'Publié il y a',
			prefixFromNow: 'd\'ici',
			seconds: 'moins d\'une minute',
			minute: 'environ une minute',
			minutes: 'environ %d minutes',
			hour: 'une heure',
			hours: '%d heures',
			day: 'un jour',
			days: '%d jours',
			month: 'un mois',
			months: '%d mois',
			year: 'un an',
			years: '%d ans'
		};
	}
	
	/* Time Ago */
	App.components.exports('timeAgo', function timeAgo () {
		
		var page;
		var NB_JOURS = 30 * 24 * 60 * 60 * 1000;
		
		var init = function (p) {
			page = p;
			$('time.js-time-ago').each(function (i, e) {
				var t = $(this);
				var d = new Date(t.attr('datetime'));
				if (new Date().getTime() - d.getTime() < NB_JOURS) {
					t.timeago();
				}
			});
		};
		
		return {
			init: init
		};
	
	});
	
})(jQuery, window, document);

/**
 * @author Deux Huit Huit
 */

(function ($, w, win, undefined) {
	
	'use strict';

	var defaultOptions = {
		ctn: $(),
		video: null,
		videoSelector: '.js-video',
		resizeContainerSelector: '',
		onTimeUpdate: $.noop,
		onCanPlay: $.noop,
		onPlaying: $.noop,
		resizable: true,
		onLoaded: $.noop,
		onEnded: $.noop
	};

	var RESET_ON_END_ATTR = 'data-video-reset-on-end';
	var RATIO_ATTR = 'data-video-ratio';

	// jQuery fun
	(function ($) {
		var factory = function (fx) {
			return function () {
				var args = Array.prototype.slice.call(arguments);
				return $(this).each(function (i, e) {
					if (!!e && $.isFunction(e[fx])) {
						e[fx].apply(e, args);
					}
				});
			};
		};
		var factoryProp = function (prop) {
			return function (value) {
				if (value === undefined) {
					var domElement = $(this).get(0);
					return !domElement ? 0 : (domElement[prop] || 0);
				}
				return $(this).each(function (i, e) {
					if (!!e) {
						$(e).get(0)[prop] = value;
					}
				});
			};
		};
		$.fn.mediaPlay = factory('play');
		$.fn.mediaPause = factory('pause');
		$.fn.mediaLoad = factory('load');
		
		$.fn.mediaCurrentTime = factoryProp('currentTime');
		$.fn.mediaPaused = factoryProp('paused');
		$.fn.mediaMuted = factoryProp('muted');
		$.fn.mediaHeight = factoryProp('videoHeight');
		$.fn.mediaWidth = factoryProp('videoWidth');
	})($);
	
	App.components.exports('video', function (options) {
		var o = $.extend({}, defaultOptions, options);

		var resizeVideo = function () {
			if (!!o.resizable) {
				var ref = !!o.video.closest(o.resizeContainerSelector).length ?
					o.video.closest(o.resizeContainerSelector) : o.ctn;
				var refW = ref.width();
				var refH = ref.height();
				var ratio = o.video.mediaWidth() / o.video.mediaHeight();

				var newSize = $.sizing.aspectFill({
					width: refW,
					height: refH,
					preferWidth: false
				}, ratio);

				//Round size to avoid part of pixel
				newSize.height = Math.ceil(newSize.height);
				newSize.width = Math.ceil(newSize.width);

				var newPosition = $.positioning.autoPosition({
					position: 'center',
					left: 'left',
					top: 'top'
				}, $.size(refW, refH), newSize);

				o.video.size(newSize).css(newPosition).data({
					size: newSize,
					position: newPosition
				});
			}
		};

		// EVENTS
		var onTimeUpdate = function (e) {
			if (!!status.currentTime) {
				App.mediator.notify('video.timeupdate', {
					video: o.video,
					e: e
				});
			}
			
			App.callback(o.onTimeupdate, [o.video]);
		};

		var onPlaying = function (e) {
			App.modules.notify('changeState.update', {
				item: o.ctn,
				state: 'paused',
				action: 'off'
			});

			App.modules.notify('changeState.update', {
				item: o.ctn,
				state: 'playing',
				action: 'on'
			});

			App.callback(o.onPlaying, [o.ctn, o.video]);
		};

		var onCanPlay = function (e) {
			resizeVideo();

			App.modules.notify('changeState.update', {
				item: o.ctn,
				state: 'paused',
				action: 'off'
			});

			App.modules.notify('changeState.update', {
				item: o.ctn,
				state: 'video-loaded',
				action: 'on'
			});

			App.callback(o.onCanPlay, [o.ctn, o.video]);
		};
		
		var onLoaded = function (e) {
			resizeVideo();
			App.callback(o.onLoaded, [o.ctn, o.video]);
		};

		var onEnded = function () {
			if (o.video.filter('[' + RESET_ON_END_ATTR + ']').length) {
				App.modules.notify('changeState.update', {
					item: o.ctn,
					state: 'playing',
					action: 'off'
				});
			}
			App.callback(o.onEnded, [o.ctn, o.video]);
		};

		// METHODS
		var loadVideo = function () {
			o.video.mediaLoad();
		};

		var playVideo = function () {
			o.video.mediaPlay();
		};

		var pauseVideo = function () {
			App.modules.notify('changeState.update', {
				item: o.ctn,
				state: 'paused',
				action: 'on'
			});

			o.video.mediaPause();
		};

		var seekVideo = function (time) {
			o.video.mediaCurrentTime(time);
		};

		var toggleMute = function () {
			o.video.mediaMuted(!o.video.mediaMuted());
		};

		var togglePlayVideo = function () {
			if (!o.video.mediaPaused()) {
				pauseVideo();
			} else {
				playVideo();
			}
		};

		var destroy = function () {
			o.video.off('timeUpdate', onTimeUpdate)
				.off('canplay', onCanPlay)
				.off('playing', onPlaying)
				.off('ended', onEnded)
				.off('loadedmetadata', onLoaded);

			loadVideo();
			o.video = null;
			o = {};
		};

		var init = function (ctn, options) {
			o = $.extend({}, o, options);

			o.ctn = $(ctn);
			o.video = ctn.find(o.videoSelector);

			// attach events
			o.video.on('timeupdate', onTimeUpdate)
				.on('canplay', onCanPlay)
				.on('playing', onPlaying)
				.on('ended', onEnded)
				.on('loadedmetadata', onLoaded);
		};
		
		return {
			init: init,
			resize: resizeVideo,
			destroy: destroy,
			load: loadVideo,
			play: playVideo,
			togglePlay: togglePlayVideo,
			pause: pauseVideo,
			seek: seekVideo
		};
	});
	
})(jQuery, window, jQuery(window));

/**
 *  @author Deux Huit Huit
 *
 *  Alt language link updater
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
			// add complete url
			linkList[data.url] = linkData;
			// remove query string
			if (data.url.indexOf('?') !== -1) {
				var url = data.url.split('?')[0];
				linkList[url] = linkData;
			}
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
		pages: {
			loaded: onPageLoaded
		},
		page: {
			enter: onEnter
		},
		articleChanger: {
			loaded: onPageLoaded,
			enter: onEnter
		}
	};
	
	var AltLanguageLinkUpdater = App.modules.exports('altLanguageLinkUpdater', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto change state click
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var BUTTON_SELECTOR = '.js-change-state-click';
	var BUTTON_TARGET_ATTR = 'data-change-state-click-target';
	var BUTTON_STATE_ATTR = 'data-change-state-click';
	var BUTTON_ACTION_ATTR = 'data-change-state-action';
	var BUTTON_MAX_WIDTH_ATTR = 'data-change-state-max-width';
	var BUTTON_MIN_WIDTH_ATTR = 'data-change-state-min-width';
	var BUTTON_PREVENT_DEFAULT_ATTR = 'data-change-state-click-prevent-default';

	
	var findTargetItemIfAvailable = function (item, target) {
		//Find target if present
		if (target) {
			return site.find(target);
		} else {
			return item;
		}
	};

	var buttonClicked = function (e) {
		var t = $(this);

		var target = t.attr(BUTTON_TARGET_ATTR);
		var state = t.attr(BUTTON_STATE_ATTR);
		var action = t.attr(BUTTON_ACTION_ATTR);
		var minWidth = t.attr(BUTTON_MIN_WIDTH_ATTR);
		var maxWidth = t.attr(BUTTON_MAX_WIDTH_ATTR);

		var item = t;
		var isMinWidthValid = (!!minWidth && window.mediaQueryMinWidth(minWidth)) || !minWidth;
		var isMaxWidthValid = (!!maxWidth && window.mediaQueryMaxWidth(maxWidth)) || !maxWidth;

		//Valid needed info
		if (state && action && isMinWidthValid && isMaxWidthValid) {

			item = findTargetItemIfAvailable(item, target);

			//Process item algo
			App.modules.notify('changeState.update', {
				item: item,
				state: state,
				action: action
			});
			
			if (t.filter('[' + BUTTON_PREVENT_DEFAULT_ATTR + ']').length) {
				return window.pd(e);
			}
		}
	};

	var init = function () {
		//Attach click handler
		site.on(App.device.events.click, BUTTON_SELECTOR, buttonClicked);
	};
	
	App.modules.exports('auto-change-state-click', {
		init: init
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto change state hover
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var BUTTON_SELECTOR = '.js-change-state-hover';
	var BUTTON_STATE_ATTR = 'data-change-state-hover';
	var BUTTON_TARGET_ATTR = 'data-change-state-hover-target';
	var BUTTON_TARGET_COMMON_ANCESTOR_ATTR = 'data-change-state-hover-target-common-ancestor';

	var findTargetItemIfAvailable = function (item, target) {
		//Find target if present
		if (target) {
			var scope = site;
			var commonAncestor = item.attr(BUTTON_TARGET_COMMON_ANCESTOR_ATTR);

			if (commonAncestor) {
				scope = item.closest(commonAncestor);
			}
			return scope.find(target);
		} else {
			return item;
		}
	};

	var mouseEnterLeave = function (e) {
		var t = $(this);

		var target = t.attr(BUTTON_TARGET_ATTR);
		var state = t.attr(BUTTON_STATE_ATTR);

		var item = t;

		//Valid needed info
		if (state) {

			item = findTargetItemIfAvailable(item, target);

			//Process item algo
			App.modules.notify('changeState.update', {
				item: item,
				state: state,
				action: 'toggle'
			});
		}

		return window.pd(e);
	};

	var init = function () {
		//Attach click handler
		site.on('mouseenter', BUTTON_SELECTOR, mouseEnterLeave);
		site.on('mouseleave', BUTTON_SELECTOR, mouseEnterLeave);
	};
	
	App.modules.exports('auto-change-state-on-hover', {
		init: init
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto cycle
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	var site = $('#site');
	var isFirstLoad = true;
	var page = $('.page');

	// stop videos when changinf slide
	var onCycleBefore = function (e, o, outSlide, inSlide, foward) {
		var vCtn = $(outSlide).find('.js-oembed-video-player');

		if (!!vCtn.length) {
			App.modules.notify('pauseVideo', vCtn);
		}
	};

	var onCycleAfter = function (e, o, outSlide, inSlide, foward) {
		if (!App.device.mobile) {
			$(this).cycle('resume');

			var oembedCtn = $(outSlide).find('.js-oembed-video-ctn');
			var player = oembedCtn.find('.js-oembed-video-player');

			if (!!player.hasClass('loaded')) {
				oembedCtn.removeClass('is-playing');
				player.removeClass('loaded').empty();
			}
		}
	};

	// GESTION DES VIDEOS OEMBED DANS UN CYCLE
	var onOembedFinish = function (data) {
		if (!App.device.mobile) {
			data.container.closest('.js-cycle').cycle('resume');
		}
	};

	var onOembedPlayClick = function (e) {
		var t = $(this);
		var vCtn = t.closest('.js-oembed-video-ctn');
		var vPlayer = vCtn.find('.js-oembed-video-player');
		
		if (!App.device.mobile) {
			App.modules.notify('loadVideo', {
				player: vPlayer,
				autoplay: true,
				finish: onOembedFinish
			});
		}
		
		vCtn.addClass('is-playing');
		if (!App.device.mobile) {
			t.closest('.js-cycle').cycle('pause');
		}
		
		return window.pd(e);
	};

	var loadCycleVideo = function () {
		page.find('.js-cycle-slide.video .js-oembed-video-ctn').each(function () {
			var t = $(this);
			var vPlayer = t.find('.js-oembed-video-player');
			
			App.modules.notify('loadVideo', {
				player: vPlayer,
				finish: onOembedFinish
			});
		});
	};

	var pageEnter = function (key, data) {
		page = $(data.page.key());
		
		$('.js-cycle:not(.cycle-inited)').each(function () {
			var t = $(this);
			
			if (!t.data('cycle-disable-mobile') || !App.device.mobile) {
				var o = {
					slides: t.attr('data-cycle-slides') || '>img',
					pager: t.attr('data-cycle-pager') || '> .cycle-pager',
					pagerTemplate: t.attr('data-cycle-pager-template') || '<span><span>',
					next: t.attr('data-cycle-next') || '> .cycle-next',
					prev: t.attr('data-cycle-prev') || '> .cycle-prev',
					timeout: parseInt(t.attr('data-cycle-timeout'), 10) || 4000,
					paused: App.device.mobile ? true : t.attr('data-cycle-paused') || false,
					pauseOnHover: t.attr('data-cycle-pause-on-hover') || true,
					fx: t.attr('data-cycle-fx') || 'fade',
					caption: t.attr('data-cycle-caption') || '> .cycle-caption',
					log: App.debug()
				};
				
				t.cycle(o);
				t.on('cycle-before', onCycleBefore);
				t.on('cycle-after', onCycleAfter);
				
				t.addClass('cycle-inited');
			}
		});

		if (!isFirstLoad && App.device.mobile) {
			loadCycleVideo();
		}
	};

	var onSiteLoaded = function () {
		isFirstLoad = false;
		if (App.device.mobile) {
			loadCycleVideo();
		}
		
	};
	
	var init = function () {
		site.on(
			App.device.events.click,
			'.js-cycle-slide.video .js-oembed-video-play',
			onOembedPlayClick
		);
	};
	
	var actions = function () {
		return {
			site: {
				loaded: onSiteLoaded
			},
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			}
		};
	};

	App.modules.exports('auto-cycle', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * Auto flickity module
 * Front-end Integration Hierarchy:
 *
 *  |- FLICKITY CTN : .js-auto-flickity-slider-ctn
 *  |    |- CELL-CTN : .js-auto-flickity-ctn
 *  |    |    |- CELL (REPEATED): .js-auto-flickity-item
 *
 *  Requirements:
 *		- https://cdnjs.cloudflare.com/ajax/libs/flickity/1.1.2/flickity.pkgd.min.js
 *		- Component Flickity.js
 *
 *  You can have more info on the options of Flickity at
 *  http://flickity.metafizzy.co/
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site = $('#site');
	var page = $('.page');
	
	var o = {
		sliderCtn: '.js-auto-flickity-slider-ctn',
		cellCtn: '.js-auto-flickity-ctn',
		cellSelector: '.js-auto-flickity-cell',
		navBtnSelector: '.js-auto-flickity-nav-btn',

		abortedClass: 'is-flickity-cancelled',
		initedClass: 'is-flickity-inited',
		selectedClass: 'is-selected',

		imagesLoaded: true
	};

	var flickities = [];
	
	var onResize = function () {
		$.each(flickities, function () {
			this.resize();
		});
	};

	var initAllSliders = function () {
		page.find(o.sliderCtn).find(o.cellCtn).not('.' + o.initedClass).each(function () {
			var t = $(this);
			var comp = App.components.create('flickity', o);
			comp.init(t, page);
			if (comp.isInited()) {
				flickities.push(comp);
			}
		});
	};
	
	var pageEnter = function (key, data) {
		page = $(data.page.key());
		initAllSliders();
	};
	
	var pageLeaving = function (key, data) {
		if (!!data && !!data.canRemove) {
			$.each(flickities, function () {
				this.destroy();
			});
			flickities = [];
		}
		
		page = $();
	};

	var onArticleEntering = function () {
		initAllSliders();
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: pageEnter,
				leaving: pageLeaving
			},
			articleChanger: {
				entering: onArticleEntering
			}
		};
	};
	
	var AutoFlickity = App.modules.exports('auto-flickity', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto Invisible ReCaptcha
 *
 *  @requires
 *    https://www.google.com/recaptcha/api.js?onload=GoogleReCaptchaCallback&amp;render=explicit
 *    https://github.com/SagaraZD/google_recaptcha
 *    In the form
 *    <input type="hidden" name="fields[google_recaptcha]" class="js-recaptcha-response" />
 *    On the button
 *    <add class="js-recaptcha" />
 *    <set data-sitekey="{/data/params/recaptcha-sitekey}" />
 */
(function ($, undefined) {
	'use strict';

	var site = $('#site');
	var options = {
		target: '.js-recaptcha-response',
		trigger: '.js-recaptcha',
		prefix: 'g-recaptcha-'
	};
	var page = null;
	var loaded = false;
	var ids = 0;

	var load = function () {
		if (!loaded || !page) {
			return;
		}
		page.find(options.trigger).each(function () {
			var t = $(this);
			if (t.attr('id')) {
				return;
			}
			var id = options.prefix + (++ids);
			t.attr('id', id);
			window.grecaptcha.render(id, {
				sitekey: t.attr('data-sitekey'),
				callback: function (result) {
					page.find(options.target).val(result);
					App.mediator.notify('recaptcha.updated', {
						result: result,
						lastTarget: t
					});
				}
			});
		});
	};

	var pageEnter = function (key, data) {
		if (!!data.page) {
			page = $(data.page.key());
		} else if (!!data.article) {
			page = $(data.article);
		}
		load();
	};

	var init = function () {
		window.GoogleReCaptchaCallback = function () {
			loaded = true;
			load();
		};
	};
	
	var actions = function () {
		return {
			page: {
				enter: pageEnter
			},
			articleChanger: {
				enter: pageEnter
			}
		};
	};
	
	App.modules.exports('auto-invisible-recaptcha', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto jit image
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var firstTime = true;
	var site = $('#site');
	
	var onJitLoaded = function (args) {
		var t = $(args.target);
		
		if (t.hasClass('jit-image-bg-src')) {
			var bg = t.closest('.jit-image-bg');
			bg.css({
				backgroundImage: 'url(\'' + t.attr('src') + '\')'
			});
		}
	};

	var onArticleEnter = function (key, data) {
		$(data.article).find('img[data-src-format]').jitImage();
	};

	var onEnter = function (key, data) {
		if (!firstTime) {
			$(data.page.key()).find('img[data-src-format]').jitImage();
		}
		firstTime = false;
	};

	var init = function () {
		site.on('loaded.jitImage', onJitLoaded);
	};
	
	var actions = function () {
		return {
			page: {
				enter: onEnter
			},
			articleChanger: {
				enter: onArticleEnter
			}
		};
	};
	
	var AutoJitImage = App.modules.exports('auto-jit-image', {
		init: init,
		actions: actions
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Auto mailto
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var firstTime = true;
	var site = $('#site');
	var page = $('.page');
	
	var update = function (ctn) {
		ctn.find('a[data-mailto]').each(function () {
			var t = $(this);
			t.attr('href', 'mailto:' + t.attr('data-mailto'));
		});
	};

	var onArticleEnter = function (key, data) {
		update(data.article);
	};

	var onEnter = function (key, data) {
		page = $(data.page.key());
		update(page);
	};

	var init = function () {
		update(site);
	};
	
	var actions = function () {
		return {
			page: {
				enter: onEnter
			},
			articleChanger: {
				enter: onArticleEnter
			}
		};
	};
	
	var AutoMailto = App.modules.exports('auto-mailto', {
		init: init,
		actions: actions
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Auto merge qs value
 *      Allow a link or a button to append a key-value pair in the Querystring.
 *      Limitation : Can be only one key-value pair by button
 *      If used with a link. the href should be corresponding to the js behavior
 *      It Need to be used with data-action="none" or the links modules will also trigger.
 *      It will automatically raise the page.updateQsFragment with the new querystring builded.
 *      If the value is "" then the key will be removed from the QS (Filter all);
 *      Optionnaly you can make a key exclusif by removing other key when setting a key with
 *      the remove-keys attribute.
 *      Optionnaly you can make a key-value toggling behavior.
 *
 *  Query string example:
 *      ?{key}={value}
 *
 *  SELECTOR :
 *      .js-merge-qs-value-button
 *
 *  ATTRIBUTES :
 *      REQUIRED :
 *
 *      - data-merge-qs-value-key
 *          Define the key used for the querystring.
 *
 *      OPTIONAL :
 *
 *      - data-merge-qs-value
 *          Define the value associated to the key
 *
 *      - data-merge-qs-value-remove-keys
 *          List of keys separated by ','
 *          to be removed when the key-value is set
 *
 *      - data-merge-qs-value-prevent-default
 *          If present, will prevent default
 *
 *      - data-merge-qs-value-toggle
 *          If present, will toggle the key-value pair from the qs
 */
(function ($, undefined) {
	'use strict';
	var win = $(window);
	var site = $('#site');
	var curPage = $();
	
	var BUTTON_SELECTOR = '.js-merge-qs-value-button';
	var KEY_ATTR = 'data-merge-qs-value-key';
	var REMOVE_KEYS_ATTR = 'data-merge-qs-value-remove-keys';
	var VALUE_ATTR = 'data-merge-qs-value';
	var PREVENT_DEFAULT_ATTR = 'data-merge-qs-value-prevent-default';
	var TOGGLE_KEY_VALUE_ATTR = 'data-merge-qs-value-toggle';
	
	var buttonClicked = function (e) {
		
		//Scroll To hash
		var t = $(this);
		var key = t.attr(KEY_ATTR);
		var removeKeys = t.attr(REMOVE_KEYS_ATTR);
		var value = t.attr(VALUE_ATTR) || null;
		var qs = App.routing.querystring.parse(document.location.search);
		
		// Minimal attribute needed for proceeding
		if (!!key) {

			if (t.filter('[' + TOGGLE_KEY_VALUE_ATTR + ']').length) {
				//Toggle action
				if (qs[key] && qs[key] == value) {
					qs[key] = null;
				} else {
					qs[key] = value;
				}
			} else {
				//Build new qs
				if (!!value) {
					qs[key] = value;
				} else {
					qs[key] = null;
				}
			}
			
			if (!!removeKeys) {
				var removeKeysArray = removeKeys.split(',');
				$.each(removeKeysArray, function (i, e) {
					qs[e] = null;
				});
			}

			// Update Url and raise fragmentChanged
			App.mediator.notify('page.updateQsFragment', {
				qs: qs,
				raiseFragmentChanged: true
			});
			
			if (t.filter('[' + PREVENT_DEFAULT_ATTR + ']').length) {
				return window.pd(e, true);
			}
		}
	};
	
	var init = function () {
		site.on(App.device.events.click, BUTTON_SELECTOR, buttonClicked);
	};
	
	App.modules.exports('auto-merge-qs-value', {
		init: init
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto modal
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var BTN_SELECTOR = '.js-auto-modal-btn';
	var COMMON_ANCESTOR_SELECTOR_ATTR = 'data-auto-modal-common-ancestor';
	var POPUP_SELECTOR_ATTR = 'data-auto-modal-popup-selector';
	var INNER_SCROLL_ATTR = 'data-inner-scroll-selector';
	
	var toggleModalState = function (popup, isPopep) {
		var scrollFx = isPopep ? 'removeScroll' : 'addScroll';
		App.modules.notify('site.' + scrollFx);
	};

	var onButtonClick = function (e) {
		var t = $(this);
		var commonAncestor = t.closest(t.attr(COMMON_ANCESTOR_SELECTOR_ATTR));
		var reelRef = !!commonAncestor.length ? commonAncestor : site;
		var popup = reelRef.find(t.attr(POPUP_SELECTOR_ATTR));
		
		if (!!popup.length) {
			App.modules.notify('popup.toggle', {
				popup: popup,
				openCallback: function () {
					toggleModalState(popup, true);
				},
				closeCallback: function () {
					popup.find(popup.attr(INNER_SCROLL_ATTR)).scrollTop(0);
					toggleModalState(popup, false);
				}
			});
		} else {
			App.log('auto-modal: No popup found with selector : ' + t.attr(POPUP_SELECTOR_ATTR));
		}
		
		return window.pd(e);
	};

	var init = function () {
		site.on($.click, BTN_SELECTOR, onButtonClick);
	};
	
	App.modules.exports('auto-modal', {
		init: init
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto oembed
 *      Module to manage oembed components
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var win = $(window);
	var site = $('#site');
	var page = $();
	var components = [];
	var isFirstTime = true;
	var BTN_PLAY_SEL = '.js-auto-oembed-play';
	var PLAYER_SEL = '.js-auto-oembed-player';
	var CTN_SEL = '.js-auto-oembed-ctn';
	var DATA_KEY = 'auto-oembed';
	
	var destroyOembed = function (ctn) {
		ctn.find(CTN_SEL).each(function () {
			var t = $(this);
			var vPlayer = t.find(PLAYER_SEL);
			var oembed = t.data(DATA_KEY);

			App.modules.notify('changeState.update', {
				item: t,
				state: 'playing',
				action: 'off'
			});

			if (!!oembed) {
				oembed.destroy();
			}
			t.data(DATA_KEY, null);
		});
	};
	
	var embedOne = function (ctx, force) {
		var vPlayer = ctx.find(PLAYER_SEL);
		var autoLoad = vPlayer.attr('data-autoload');
		
		if (!force) {
			if (App.device.mobile && autoLoad !== 'mobile' && autoLoad !== 'all') {
				return;
			}
			if (!App.device.mobile && autoLoad === 'none') {
				return;
			}
		}
		
		var oembed = ctx.data(DATA_KEY) || App.components.create('oembed', {
			container: ctx,
			player: vPlayer
		});

		ctx.data(DATA_KEY, oembed);
		components.push(oembed);
		oembed.load({
			finish: function () {
				App.modules.notify('changeState.update', {
					item: ctx,
					state: 'playing',
					action: 'off'
				});
			}
		});
		return oembed;
	};
	
	var embedAll = function (ctx) {
		var scope = ctx.is(CTN_SEL) ? ctx : ctx.find(CTN_SEL);
		scope.each(function () {
			embedOne($(this));
		});
	};

	var pause = function (ctx) {
		var d = ctx.data();

		if (d && d.autoOembed) {
			d.autoOembed.pause();
		}
	};

	var pauseAll = function (ctx) {
		var scope = ctx.is(CTN_SEL) ? ctx : ctx.find(CTN_SEL);
		scope.each(function () {
			pause($(this));
		});
	};

	var onPauseAll = function (key, data) {
		if (data && data.item) {
			pauseAll(data.item);
		}
	};
	
	var onPlayBtnClick = function (e) {
		var t = $(this);
		var pauseAllOther = t.attr('data-auto-oembed-pause-other-on-play') === 'true';
		var vCtn = t.closest(CTN_SEL);
		var oembed = vCtn.data(DATA_KEY);
		

		if (pauseAllOther) {
			pauseAll($('#site'));
		}

		if (!oembed) {
			oembed = embedOne(vCtn, true);
		} else {
			App.modules.notify('changeState.update', {
				item: vCtn,
				state: 'playing',
				action: 'on'
			});
			oembed.play();
		}
		
		return global.pd(e);
	};
	
	var onPageEnter = function (key, data) {
		page = $(data.page.key());
		if (!isFirstTime) {
			embedAll(page);
		}
	};
	
	var onPageLeave = function () {
		destroyOembed(page);
		page = $();
		components = [];
	};
	
	var onSiteLoaded = function () {
		isFirstTime = false;
		embedAll(site);
	};
	
	var onInfiniteScrollLoaded = function (key, data) {
		if (!!data.ctn) {
			embedAll(data.ctn);
		}
	};
	
	var onArticleChangerEnter = function (key, data) {
		destroyOembed(page);
		
		if (!!data.article) {
			embedAll(data.article);
		}
	};
	
	var init = function () {
		site.on(App.device.events.click, BTN_PLAY_SEL, onPlayBtnClick);
	};
	
	var actions = function () {
		return {
			page: {
				enter: onPageEnter,
				leaving: onPageLeave
			},
			site: {
				loaded: onSiteLoaded
			},
			infiniteScroll: {
				pageLoaded: onInfiniteScrollLoaded
			},
			articleChanger: {
				enter: onArticleChangerEnter
			},
			autoOembed: {
				pauseAll: onPauseAll
			}
		};
	};
	
	App.modules.exports('auto-oembed', {
		init: init,
		actions: actions
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Auto ratio size
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
	
	var updateElements = function (elements, callback) {
		elements.each(function () {
			var t = $(this);
			var r = parseRatio(t.attr('data-auto-ratio'));
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
	
	var onResize = function () {
		updateElements($('*[data-auto-ratio]', getPage()), defaultCallback);
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
 *  @author Deux Huit Huit
 *
 *  Auto screen height
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	
	var mobileHeight = 0;
	
	var getPage = function () {
		return $('.page:visible');
	};
	
	var platforms = {
		all: true,
		desktop: !App.device.mobile,
		tablette: App.device.tablet,
		mobile: App.device.mobile,
		phone: $.phone
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
		if ((App.device.mobile && Math.abs(mobileHeight - win.height()) > 120) ||
			!App.device.mobile) {
			p.filter('.js-auto-screen-height')
				.add($('.js-auto-screen-height', p))
				.each(resizeItem);
			mobileHeight = win.height();
		}
	};
	
	var onEnter = function () {
		mobileHeight = 0;
		onResize();
		if (App.device.mobile) {
			mobileHeight = win.height();
		}
		
		setTimeout(onResize, 100);
	};
	
	var init = function () {
		onResize();
		if (App.device.mobile) {
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
 *  @author Deux Huit Huit
 *
 *  Auto scroll to id
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var scrollToIdClicked = function (e) {
		
		//Scroll To hash
		var t = $(this);
		var href = t.attr('href');
		var h = href.split('#')[1];
		var scrollCtn = null;
		var html = $('html');
		
		var offsetSelector = t.attr('data-scroll-to-id-offset-selector');
		var offset = 0;
		var scrollCtnAttr = t.attr('data-scroll-to-id-scroll-ctn');
		
		if (!!scrollCtnAttr) {
			scrollCtn = t.closest('.page').find(scrollCtnAttr);
		}
		
		if (!!offsetSelector) {
			var offsetItem = $(offsetSelector).eq(0);
			offset = offsetItem.height() * -1;
		}
		
		var target = site.find('#' + h);
		
		if (!!target.length) {
			offset += target.offset().top;
			html.velocity('scroll', {
				offset: offset + 'px',
				mobileHA: false,
				container: scrollCtn
			});
			t.sendClickEvent({
				cat: t.attr('data-ga-cat') || 'Scroll to top',
				event: e
			});
			return window.pd(e);
		}
	};
	
	var init = function () {
		site.on(App.device.events.click, '.js-scroll-to-id-button', scrollToIdClicked);
	};
	
	App.modules.exports('auto-scroll-to-id', {
		init: init
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto share this
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
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * auto slide on click
 *
 * - Container: optionnal. If present, when opening an item, it will close the
 *	 other items present in the container, just like an accordeon.
 *	 <add class="js-auto-slide-click" />
 *
 * - Item: container of the trigger and slide
 *	 <add class="js-auto-slide-click-item" />
 *	 <add data-auto-slide-click-max-width="" />
 *	 <add data-auto-slide-click-min-width="" />
 *
 * - Trigger: toggle The slide. A change-state toggle is done on the trigger.
 *	 When state is "on", it will notify onToggleOn to close the other items if
 *	 <add class="js-auto-slide-click-trigger" />
 *	 <add data-auto-slide-click-state-add-class="" />
 *	 <add data-auto-slide-click-state-rem-class="" />
 *	 <add data-auto-slide-click-state-notify-on="autoSlideClick.toggleOn" />
 *
 * - Slide: Item that slides up and down
 *	 <add class="js-auto-slide-click-slide" />
 *	 <add data-auto-slide-click-state-add-class="" />
 *	 <add data-auto-slide-click-state-rem-class="" />
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var win = $(window);
	var html = $('html');
	
	var CTN_SELECTOR = '.js-auto-slide-click';
	var ITEM_SELECTOR = '.js-auto-slide-click-item';
	var TRIGGER_SELECTOR = '.js-auto-slide-click-trigger';
	var SLIDE_SELECTOR = '.js-auto-slide-click-slide';
	
	var STATE = 'auto-slide-click';
	
	var TRIGGER_MAX_WIDTH_ATTR = 'data-auto-slide-click-max-width';
	var TRIGGER_MIN_WIDTH_ATTR = 'data-auto-slide-click-min-width';
	
	// close other when opening one
	var onToggleOn = function (key, data) {
		var curItem = data.item.closest(ITEM_SELECTOR);
		var ctn = data.item.closest(CTN_SELECTOR);
		var items = ctn.find(ITEM_SELECTOR).not(curItem);
		
		items.each(function () {
			var t = $(this);
			var trigger = t.find(TRIGGER_SELECTOR);
			var slide = t.find(SLIDE_SELECTOR);
			
			//trigger
			App.modules.notify('changeState.update', {
				item: trigger,
				state: STATE,
				action: 'off'
			});
			
			//tiroir
			App.modules.notify('slide.update', {
				item: slide,
				state: STATE,
				action: 'up'
			});
		});
	};
	
	var updateSlideState = function (key, data) {
		var item = data.trigger.closest(ITEM_SELECTOR);
		var slide = item.find(SLIDE_SELECTOR);

		var minWidth = item.attr(TRIGGER_MIN_WIDTH_ATTR);
		var maxWidth = item.attr(TRIGGER_MAX_WIDTH_ATTR);
		var isMinWidthValid = (!!minWidth && window.mediaQueryMinWidth(minWidth)) || !minWidth;
		var isMaxWidthValid = (!!maxWidth && window.mediaQueryMaxWidth(maxWidth)) || !maxWidth;
		
		if (isMinWidthValid && isMaxWidthValid) {
			//Process item algo
			App.modules.notify('slide.update', {
				item: slide,
				state: STATE,
				action: data.slideAction
			});
			
			App.modules.notify('changeState.update', {
				item: data.trigger,
				state: STATE,
				action: data.triggerAction
			});
		}
	};
	
	var onTriggerClick = function (e) {
		var t = $(this);
		
		updateSlideState('', {
			trigger: t,
			triggerAction: 'toggle',
			slideAction: 'toggle'
		});
		
		return window.pd(e);
	};
	
	var init = function () {
		$('#site').on(App.device.events.click, TRIGGER_SELECTOR, onTriggerClick);
	};
	
	var actions = function () {
		return {
			autoSlideClick: {
				toggleOn: onToggleOn,
				updateSlideState: updateSlideState
			}
		};
	};
	
	var autoAccordion = App.modules.exports('auto-slide-click', {
		init: init,
		actions: actions
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Auto sync property
 *      Allow to set local property with an external element target by the source attribute.
 *      The value will be keep it in sync with the element on each resize of the window and
 *      in each pageEnter.
 *
 *  JS Selector :
 *      .js-auto-sync-property:
 *
 *  DATA ATTRIBUTES :
 *      REQUIRED
 *
 *      - data-sync-property :
 *          : Property to change on the element
 *
 *      - data-sync-property-from :
 *          : JQuery Selector to identify the element used to read the value.
 *          : By default will use a scope from the #site element
 *          : (see common ancestor for alternative selection)
 *
 *      OPTIONAL :
 *
 *      - data-sync-property-with :
 *          : Property to read if different than the set property
 *
 *      - data-sync-property-from-common-ancestor :
 *          : To specify a closer scope between the target and the current element.
 *          : Will find the scope with
 *          :     element.closest({value}).find({from})
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var ITEM_SELECTOR = '.js-auto-sync-property';
	var PROPERTY_ATTR = 'data-sync-property';
	var WITH_PROPERTY_ATTR = 'data-sync-property-with';
	var SOURCE_ATTR = 'data-sync-property-from';
	var COMMON_ANCESTOR_ATTR = 'data-sync-property-from-common-ancestor';
	
	var processItem = function (t) {
		var property = t.attr(PROPERTY_ATTR);

		if (!!property) {
			var sourceSelector = t.attr(SOURCE_ATTR);
			var commonAncestorSelector = t.attr(COMMON_ANCESTOR_ATTR);
			var withProperty = t.attr(WITH_PROPERTY_ATTR);
			var scope = site;
			var source = null;

			if (!!commonAncestorSelector) {
				scope = t.closest(commonAncestorSelector);
			}

			if (!!scope.length) {
				source = scope.find(sourceSelector);
			}

			// Use property if no with property specified
			if (!withProperty) {
				withProperty = property;
			}

			if (source.length) {
				var value;

				if (withProperty == 'height') {
					// Ensure to get not rounded value from jquery
					value = Math.floor(parseFloat(window.getComputedStyle(source[0]).height));
				} else if (withProperty == 'outerHeight') {
					value = source.outerHeight();
				} else {
					value = source[withProperty]();
				}

				t.css(property, value);
			}
		}
	};

	var processAllItems = function () {
		site.find(ITEM_SELECTOR).each(function (i, e) {
			var t = $(this);
			processItem(t);
		});
	};

	var onResize = function () {
		processAllItems();
	};

	var onPageEnter = function () {
		processAllItems();
		setTimeout(processAllItems, 50);
	};
	
	var init = function () {
		processAllItems();
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize
			},
			page: {
				enter: onPageEnter
			},
			articleChanger: {
				enter: onPageEnter
			}
		};
	};
	
	App.modules.exports('auto-sync-property', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto sync state from qs
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	
	var ITEM_SELECTOR = '.js-auto-sync-state-from-qs';
	var ATTR_STATES = 'data-sync-state-from-qs';

	var setItemState = function (item, state, flag) {
		App.modules.notify('changeState.update', {
			item: item,
			state: state,
			action: flag ? 'on' : 'off'
		});
	};

	var processItemState = function (item, state, conditions) {
		var isOn = false;
		var qs = App.routing.querystring.parse(document.location.search);

		$.each(conditions.split(','), function (i, e) {
			var splitedCondition = e.split('=');
			var key = splitedCondition[0];
			var value = splitedCondition[1];

			if (value.length) {
				if (qs[key] && qs[key] == value) {
					isOn = true;
				}
			} else if (qs[key] && qs[key].length === 0 || !!!qs[key]) {
				//Set state on when empty
				isOn = true;
			}
		});

		setItemState(item, state, isOn);
	};

	var syncState = function () {
		site.find(ITEM_SELECTOR).each(function () {
			var t = $(this);
			var states = t.attr(ATTR_STATES);

			if (states.length) {
				var statesList = states.split(';');

				$.each(statesList, function (i, e) {
					var splitedStateValue = e.split(':');
					var state = splitedStateValue[0];
					var conditions = splitedStateValue[1];

					processItemState(t, state, conditions);
				});
			}
		});
	};

	var onFragmentChanged = function () {
		syncState();
	};
	
	var init = function () {
		syncState();
	};
	
	var actions = function () {
		return {
			page: {
				fragmentChanged: onFragmentChanged
			}
		};
	};
	
	App.modules.exports('auto-sync-state-from-qs', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto toggle class on scroll 3 state
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var page = $('.page');
	var scrollTimer = 0;
	var resizeTimer = 0;
	var curY = 0;
	var winH = 0;
	var scrollOffsetTop = 0;

	var CTN_SELECTOR = '.js-tcos-3-state-ctn';
	var CONTENT_SELECTOR = '.js-tcos-3-state-content';
	var SECOND_CLASS_ATTR = 'data-tcos-second-state-class';
	var THIRD_CLASS_ATTR = 'data-tcos-third-state-class';

	var OFFSET_SELECTOR = '.js-site-nav';
	var OFFSET_TOP = 'data-tcos-offset-top';
	var OFFSET_BOTTOM = 'data-tcos-offset-bottom';

	var rafTimer;

	var updatePageDock = function () {
		window.craf(rafTimer);
		rafTimer = window.raf(function () {
			page.find(CONTENT_SELECTOR).each(function () {
				var t = $(this);
				App.callback(t.data('tcosFx'));
			});
		});
	};

	var setPageDockData = function () {
		page.find(CONTENT_SELECTOR).each(function () {
			var t = $(this);
			var ctn = t.closest(CTN_SELECTOR);

			var ctnOffTop = Math.floor(ctn.offset().top);
			var ctnH = Math.floor(ctn.outerHeight());
			var offTop = Math.floor(t.offset().top);
			var height = Math.floor(t.outerHeight());

			var doIt = function () {
				var fixedClass = !!t.attr(SECOND_CLASS_ATTR) ?
					t.attr(SECOND_CLASS_ATTR) : '';
				var absClass = !!t.attr(THIRD_CLASS_ATTR) ?
					t.attr(THIRD_CLASS_ATTR) : '';

				var offsetTopElement = $();
				if (t.attr('data-tcos-offset-top-selector')) {
					offsetTopElement = $(t.attr('data-tcos-offset-top-selector'));
				}

				var extraOffsetTop = winH * (t.attr('data-tcos-offset-top') || 0) ;
				var extraOffsetBottom = winH * (t.attr('data-tcos-offset-bottom') || 0);

				if (offsetTopElement.length) {
					extraOffsetTop -= offsetTopElement.outerHeight();
				}

				var oTop = ctnOffTop;
				var oBot = ctnOffTop + ctnH;

				var fx = function () {
					t.removeClass(absClass + ' ' + fixedClass);
				};

				if (((oTop + extraOffsetTop) <= curY) &&
					((oBot + extraOffsetBottom) - curY) > height) {
					t.data('tcosFx', function () {
						//Remove step 3
						t.removeClass(absClass);
						//Add Step 2
						t.addClass(fixedClass);
					});
				} else if (((oBot + extraOffsetBottom) - curY) <= height) {
					t.data('tcosFx', function () {
						//Remove Step 2
						t.removeClass(fixedClass);
						//Add Step 3
						t.addClass(absClass);
					});
				} else {
					t.data('tcosFx', function () {
						t.removeClass(absClass + ' ' + fixedClass);
					});
				}
			};

			if (ctn.height() > t.height()) {
				doIt();
			}
		});
	};

	var resetPageDock = function () {
		page.find(CONTENT_SELECTOR).each(function () {
			var t = $(this);
			var fixedClass = !!t.attr(SECOND_CLASS_ATTR) ?
				t.attr(SECOND_CLASS_ATTR) : '';
			var absClass = !!t.attr(THIRD_CLASS_ATTR) ?
				t.attr(THIRD_CLASS_ATTR) : '';
			t.removeClass(fixedClass + ' ' + absClass);
		});
	};

	// SCROLL
	var onScroll = function () {
		scrollOffsetTop = $(OFFSET_SELECTOR).height();

		curY = Math.floor(win.scrollTop() + scrollOffsetTop);
		winH = Math.floor(win.height() - scrollOffsetTop);
		setPageDockData();
	};

	var onPostscroll = function () {
		window.craf(scrollTimer);

		scrollTimer = window.raf(function () {
			updatePageDock();
		});
	};

	var onResize = function () {
		window.craf(resizeTimer);

		resizeTimer = window.raf(function () {
			onScroll();
			onPostscroll();
		});
	};

	// PAGE / ARTICLE CHANGER EVENTS
	var onPageEnter = function (key, data) {
		page = $(data.page.key());

		onScroll();
		onPostscroll();
	};

	var onPageLeave = function (key, data) {
		if (data.canRemove) {
			resetPageDock();
		}
	};

	var onArticleEnter = function () {
		onScroll();
		onPostscroll();
	};

	var onArticleLeave = function () {
		resetPageDock();
	};
	
	var init = function () {
		
	};
	
	var actions = function () {
		return {
			site: {
				scroll: onScroll,
				postscroll: onPostscroll,
				resize: onResize
			},
			page: {
				enter: onPageEnter,
				leave: onPageLeave
			},
			articleChanger: {
				enter: onArticleEnter,
				leave: onArticleLeave
			},
			autoDockedSide: {
				updatePageDocks: updatePageDock
			}
		};
	};
	
	App.modules.exports('auto-toggle-class-on-scroll-3-state', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Auto toggle class on scroll
 */
(function ($, global, undefined) {
	
	'use strict';
	
	var win = $(window);
	var winHeight = win.height();
	var html = $('html');
	var htmlHeight = html.height();
	var site = $('#site');
	var elements = $();
	var curPage = $();

	var SELECTOR = '.js-auto-toggle-class-on-scroll';

	var ATTR_PREFIX = 'data-toggle-class-on-scroll-';

	var ATTR_ADD_BEFORE = ATTR_PREFIX + 'add-before';
	var ATTR_REM_BEFORE = ATTR_PREFIX + 'remove-before';
	var ATTR_ADD_AFTER = ATTR_PREFIX + 'add-after';
	var ATTR_REM_AFTER = ATTR_PREFIX + 'remove-after';
	var ATTR_REF_COMMON_ANCESTOR = ATTR_PREFIX + 'ref-common-ancestor';
	var ATTR_REF = ATTR_PREFIX + 'ref';
	var ATTR_SCREEN_OFFSET = ATTR_PREFIX + 'screen-offset';
	var ATTR_CTN = ATTR_PREFIX + 'scroll-ctn';
	var ATTR_ELEMENT_OFFSET = ATTR_PREFIX + 'element-offset';

	var scroll = function () {
		htmlHeight = html.height();
		elements.each(function () {
			var t = $(this);
			
			var clab = t.attr(ATTR_ADD_BEFORE);
			var clrb = t.attr(ATTR_REM_BEFORE);
			
			var claa = t.attr(ATTR_ADD_AFTER);
			var clra = t.attr(ATTR_REM_AFTER);
			
			var ref = $(t.attr(ATTR_REF));

			if (!!t.attr(ATTR_REF_COMMON_ANCESTOR)) {
				ref = t.closest(t.attr(ATTR_REF_COMMON_ANCESTOR))
					.find(t.attr(ATTR_REF));
			}
			

			var reelRef = ref.length ? ref : t;
			var screenOffset = t.attr(ATTR_SCREEN_OFFSET) || 0;

			var scrollCtn = win;
			
			if (!!t.attr(ATTR_CTN)) {
				scrollCtn = t.closest('.page').find(t.attr(ATTR_CTN));
			}

			var scrollPos = scrollCtn.scrollTop();

			if (!!reelRef.length) {
				var fx = function () {
					t.addClass(clab);
					t.removeClass(clrb);
					
					App.mediator.notify('autoToggleClassOnScroll.executed', {
						item: t,
						trigger: 'before',
						addedClass: clab,
						removeClass: clrb
					});
				};
				
				var refOffset = reelRef.offset().top;
				var screenOffsetInPx = winHeight * screenOffset;
				var elementOffsetInPx = 0;
				if (!!t.attr(ATTR_ELEMENT_OFFSET)) {
					site.find(t.attr(ATTR_ELEMENT_OFFSET)).each(function () {
						elementOffsetInPx += $(this).outerHeight();
					});
				}
				
				if (refOffset - screenOffsetInPx - elementOffsetInPx < scrollPos ||
					(!ref.length && // reference is itself
						scrollPos !== 0 && // we have scrolled
						scrollPos === htmlHeight - winHeight && // scrolled to end
						refOffset >= scrollPos // element is below
					)
				) {
					fx = function () {
						t.addClass(claa);
						t.removeClass(clra);
						
						App.mediator.notify('autoToggleClassOnScroll.executed', {
							item: t,
							trigger: 'after',
							addedClass: claa,
							removeClass: clra
						});
					};
				}
				t.data('autoToggleClassOnScroll', fx);
			}
		});
	};

	var scrollTimer = null;
	
	var postscroll = function () {
		window.craf(scrollTimer);
		scrollTimer = window.raf(function () {
			elements.each(function () {
				var t = $(this);
				App.callback(t.data('autoToggleClassOnScroll'));
			});
		});
	};
	
	var resizeOnly = function () {
		winHeight = Math.max(1, win.height());
		htmlHeight = Math.max(1, html.height());
	};

	var resize = function () {
		resizeOnly();
		scroll();
		postscroll();
	};

	var refreshElementsList = function () {
		elements = site.find(SELECTOR);
	};
	
	var enter = function (key, data) {
		
		curPage = $(data.page.key());
		//Check if we have other Scroll to follow
		/*curPage.find('.js-popup-inner-scroll').on('scroll', function () {
			scroll();
			postscroll();
		});*/

		refreshElementsList();
		resizeOnly();
		setTimeout(resize, 500);
	};

	var leave = function (key, data) {
		//curPage.find('.js-popup-inner-scroll').off('scroll');
	};

	var refreshAndRun = function () {
		refreshElementsList();
		scroll();
		postscroll();
	};
	
	var actions = function () {
		return {
			site: {
				scroll: scroll,
				postscroll: postscroll,
				resize: resize
			},
			page: {
				enter: enter,
				leave: leave
			},
			infiniteScroll: {
				pageLoaded: refreshElementsList
			},
			articleChanger: {
				enter: refreshAndRun
			},
			search: {
				complete: refreshAndRun
			}
		};
	};
	
	var AutoFadeOnScroll = App.modules.exports('auto-toggle-class-on-scroll', {
		actions: actions
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Auto Tracked Page module
 *
 */
(function ($, global, undefined) {

	'use strict';
	
	var tracker = App.components.create('checkpoint-event', {
		category: 'Lecture',
		checkPoints: [25, 50, 75, 90, 100]
	});
	var win = $(window);
	var winH = win.height();
	var body = $('body');
	var bodyH = body.height();
	var scrollH = bodyH - winH;
	
	var onResize = function () {
		winH = win.height();
		bodyH = body.height();
		scrollH = bodyH - winH;
	};
	
	var onEnter = function (next, data) {
		tracker.init();
		App.callback(next);
		setTimeout(onResize, 100);
	};
	
	var onLeave = function (next, data) {
		tracker.reset();
		App.callback(next);
	};
	
	var onScroll = function () {
		if (scrollH > 0) {
			tracker.track(win.scrollTop() / scrollH * 100);
		}
	};
	
	var actions = function () {
		return {
			page: {
				enter: onEnter,
				leave: onLeave
			},
			site: {
				scroll: onScroll,
				resize: onResize,
				loaded: onResize
			},
			articleChanger: {
				enter: onEnter
			}
		};
	};
	
	App.modules.exports('auto-tracked-scroll', {
		actions: actions
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Auto video
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var page = $('.page');

	var AUTO_VIDEO_SELECTOR = '.js-auto-video';
	var BTN_PLAY_SEL = '.js-auto-video-play';
	var BTN_TOGGLE_PLAY_SEL = '.js-auto-video-toggle-play';

	var resizeTimer = 0;

	var initVideo = function (video, options) {
		//Var other options
		var minimalOptions = {};

		var vOptions = $.extend({}, minimalOptions, options);

		var v = App.components.create('video', vOptions);

		v.init(video);
		v.load();

		video.data('autoVideoComponent', v);
	};

	var togglePlay = function (ctn) {
		ctn.find(AUTO_VIDEO_SELECTOR).each(function () {
			var t = $(this);
			var d = t.data();

			if (d && d.autoVideoComponent) {
				d.autoVideoComponent.togglePlay();
			}else {
				App.log('No auto-video-component found');
			}
		});
	};

	var onTogglePlayBtnClick = function () {
		var vCtn = $(this).closest('.js-auto-video-ctn');
		togglePlay(vCtn);
	};
	
	var playVideos = function (ctn) {
		ctn.find(AUTO_VIDEO_SELECTOR).each(function () {
			var t = $(this);
			var d = t.data();

			if (d && d.autoVideoComponent) {
				var video = d.autoVideoComponent;

				video.resize();
				video.play();
			} else {
				App.log('No autoVideoComponent found');
			}
		});
	};

	var initVideos = function (ctn) {
		var btns = site.find(BTN_TOGGLE_PLAY_SEL);
		btns.off($.click, onTogglePlayBtnClick);
		btns.on($.click, onTogglePlayBtnClick);

		ctn.find(AUTO_VIDEO_SELECTOR).each(function () {
			initVideo($(this));
		});
	};

	var onResize = function () {
		window.craf(resizeTimer);

		resizeTimer = window.raf(function () {
			page.find(AUTO_VIDEO_SELECTOR).each(function () {
				var d = $(this).data();
				if (d && d.autoVideoComponent) {
					d.autoVideoComponent.resize();
				}
			});
		});
	};

	var onPageEnter = function (key, data) {
		page = $(data.page.key());

		initVideos(page);
	};

	var onArticleEnter = function (key, data) {
		initVideos(data.article);
	};

	var onPageLeave = function (key, data) {
		if (!!data.canRemove) {
			page.find(AUTO_VIDEO_SELECTOR).each(function () {
				var t = $(this);
				var ctn = t.closest('.js-auto-video-ctn');
				var d = t.data();

				if (d && d.autoVideoComponent) {
					var comp = d.autoVideoComponent;
					//Remove cyclic ref
					t.data('autoVideoComponent', null);
					comp.destroy();
				}
			});
		}
	};

	var onPlayBtnClick = function (e) {
		playVideos($(this).closest('.js-auto-video-ctn'));
		return window.pd(e);
	};

	var init = function () {
		site.on($.click, BTN_PLAY_SEL, onPlayBtnClick);
	};

	var actions = function () {
		return {
			page: {
				enter: onPageEnter,
				leaving: onPageLeave
			},
			articleChanger: {
				enter: onArticleEnter
			},
			site: {
				resize: onResize
			},
			video: {
				resize: onResize
			}
		};
	};
	
	App.modules.exports('auto-video', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Blank target link
 *
 *  Listens to
 *
 *  -
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
			$(this).each(function eachTarget () {
				var t = $(this);
				var href = t.attr('href');
				
				if (!!href && (/^https?:\/\//.test(href) || /^\/workspace/.test(href))) {
					if (!t.attr('target')) {
						t.attr('target', '_blank');
						t.attr('rel', 'noopener');
					} else if (!t.attr('rel') && $.inArray(t.attr('target'), ['_blank', '_top'])) {
						t.attr('rel', 'noopener');
					}
				}
			});
		}
	});
	
	var page = $('.page');
	
	var update = function (ctn) {
		ctn.find('a').blankLink();
	};
	
	var onPageEnter = function (key, data, e) {
		page = $(data.page.key());
		
		update(page);
	};
	
	var onArticleEnter = function (key, data) {
		update(data.article);
	};
	
	var init = function () {
		$('a').blankLink();
	};
	
	var actions = {
		page: {
			enter: onPageEnter
		},
		articleChanger: {
			enter: onArticleEnter
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
 *  @author Deux Huit Huit
 *
 *  Change state
 *
 *
 *  ATTRIBUTES :
 *      (OPTIONAL)
 *      - data-{state}-state-add-class : List of class added when state goes on
 *      - data-{state}-state-rem-class : List of class removed when state goes on
 *
 *      - data-{state}-state-follower : List of selector separated by ','
 *      - data-{state}-state-follower-common-ancestor (if not present: this will be used)
 *
 *      - data-{state}-state-notify-on: custom list of notification separated by ','
 *             called when switching state to on. Data passed : {item:this}
 *      - data-{state}-state-notify-off: custom list of notification separated by ','
 *             called when switching state to off. Data passed : {item:this}
 *
 *  NOTIFY IN :
 *      - changeState.update
 *          {item,state,flag}
 *
 *
 *  NOTIFY OUT :
 *      - changeState.begin
 *          {item,state,flag}
 *      - changeState.end
 *          {item,state,flag}
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);

	var isSvgElement = function (item) {
		return !!item && !!item.length &&
			item[0].nodeName == 'polygon' ||
			item[0].nodeName == 'polyline' ||
			item[0].nodeName == 'path' ||
			item[0].nodeName == 'g' ||
			item[0].nodeName == 'circle' ||
			item[0].nodeName == 'rect' ||
			item[0].nodeName == 'text';
	};

	var doSetItemState = function (item, state, flag) {
		var flagClass = 'is-' + state;
		var addClass = item.attr('data-' + state + '-state-add-class');
		var remClass = item.attr('data-' + state + '-state-rem-class');
		var notifyOn = item.attr('data-' + state + '-state-notify-on') || '';
		var notifyOff = item.attr('data-' + state + '-state-notify-off') || '';

		//Manage notify
		if (flag && notifyOn.length) {
			$.each(notifyOn.split(','), function (i, e) {
				App.mediator.notify(e, {item: item, state: state, flag: flag});
			});
		} else if (!flag && notifyOff.length) {
			$.each(notifyOff.split(','), function (i, e) {
				App.mediator.notify(e, {item: item, state: state, flag: flag});
			});
		}

		var ieBehavior = function () {
			//IE BEHAVIOR
			var newClass = [];
			var curClass = item.attr('class').split(' ');
			var finalClass = '';

			var ieOn = function () {
				var remClassArray = [];
				if (remClass) {
					remClassArray = remClass.split(' ');
				}

				//Add New class
				if (addClass) {
					newClass.push(addClass.split(' '));
				}
				
				//Add Flag class
				newClass.push(flagClass);

				//Remove class
				$.each(curClass, function (i, e) {

					if (remClassArray.indexOf(e) == -1) {
						newClass.push(e);
					}
				});
				
				$.each(newClass, function (i, e) {
					finalClass += ' ' + e;
				});

				//Set class attribute
				item.attr('class', finalClass);
			};

			var ieOff = function () {
				//Remove Add class and flag class
				var addClassArray = [];
				if (addClass) {
					addClassArray = addClass.split(' ');
				}

				$.each(curClass, function (i, e) {
					if (e != flagClass) {
						if (addClassArray.indexOf(e) == -1) {
							newClass.push(e);
						}
					}
				});

				//Add Remove Class
				if (remClass) {
					newClass.push(remClass.split(' '));
				}

				$.each(newClass, function (i, e) {
					finalClass += ' ' + e;
				});

				item.attr('class', finalClass);
			};


			if (flag) {
				ieOn();
			} else {
				ieOff();
			}
		};

		var setSvgItemState = function () {
			if (item[0].classList) {
				if (flag) {
					item[0].classList.add(addClass);
					item[0].classList.remove(remClass);
					item[0].classList.add(flagClass);
				} else {
					item[0].classList.remove(addClass);
					item[0].classList.add(remClass);
					item[0].classList.remove(flagClass);
				}
			} else {
				ieBehavior();
			}
		};

		if (isSvgElement(item)) {
			setSvgItemState();
		} else {
			if (flag) {
				//Set state
				item.addClass(addClass);
				item.removeClass(remClass);
				item.addClass(flagClass);
			} else {
				//Remove state
				item.removeClass(addClass);
				item.addClass(remClass);
				item.removeClass(flagClass);
			}
		}
	};

	var setItemState = function (item, state, flag) {
		//Flag class
		var followerCommonAncestor = item.attr('data-' + state + '-state-follower-common-ancestor');
		var followerSelector = item.attr('data-' + state + '-state-follower');
		var followerScope = item;

		if (followerCommonAncestor) {
			followerScope = item.closest(followerCommonAncestor);
		}
		
		var followers = followerScope.find(followerSelector);

		App.modules.notify('changeState.begin', {item: item, state: state, flag: flag});

		//Execute change
		doSetItemState(item, state, flag);

		//Process followers
		followers.each(function () {
			var it = $(this);
			setItemState(it, state, flag);
		});
		
		App.modules.notify('changeState.end', {item: item, state: state, flag: flag});
	};

	var processItem = function (item, state, action, callbacks) {
		var flagClass = 'is-' + state;
		var curBoolState = item.hasClass(flagClass);

		callbacks = callbacks ? callbacks : {};

		if (isSvgElement(item)) {
			if (item[0].classList) {
				curBoolState = item[0].classList.contains(flagClass);
			} else {
				//Ie Behavior
				var classList = item.attr('class').split(' ');
				curBoolState = classList.indexOf(flagClass) != -1;
			}
		}

		if (action == 'toggle') {
			setItemState(item, state, !curBoolState);

			if (curBoolState) {
				//Off callback
				App.callback(callbacks.off);
			} else {
				//On callback
				App.callback(callbacks.on);
			}
		} else if (action == 'on') {
			if (!curBoolState) {
				setItemState(item, state, true);

				//On callback
				App.callback(callbacks.on);
			}
		} else if (action == 'off') {
			if (curBoolState) {
				setItemState(item, state, false);

				//Off callback
				App.callback(callbacks.off);
			}
		} else {
			App.log('Action: ' + action +
				' is not recognized: Actions available are : toggle, on or off');
		}
	};

	var onUpdateState = function (key, data) {
		if (data && data.item && data.state && data.action) {
			var minWidth = data.item.attr('data-' + data.state + '-state-min-width');
			var maxWidth = data.item.attr('data-' + data.state + '-state-max-width');
			var isMinWidthValid = (!!minWidth && window.mediaQueryMinWidth(minWidth)) || !minWidth;
			var isMaxWidthValid = (!!maxWidth && window.mediaQueryMaxWidth(maxWidth)) || !maxWidth;
			
			if (isMinWidthValid && isMaxWidthValid) {
				processItem(data.item, data.state, data.action, data.callbacks);
			}
		}
	};
	
	var actions = function () {
		return {
			changeState: {
				update: onUpdateState
			}
		};
	};
	
	App.modules.exports('change-state', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Cloudflare email
 *      Integration of the cloudflare email security behavior in the framework automatically
 *
 *  SELECTOR:
 *      a[href^="/cdn-cgi/l/email-protection"]
 *
 *  ACTIONS:
 *      page.enter
 *      articleChanger.enter
 */
(function ($, str, undefined) {

	'use strict';
	var SELECTOR = 'a[href^="/cdn-cgi/l/email-protection"]';
	var PATTERN = /^\[email([\u0080-\u00FF ]+)protected\]$/i;

	var process = function (a, e) {
		var j,c,s = '';

		var r = parseInt(a.substr(0, 2), 16);

		if (r) {
			for (j = 2; j < a.length; j += 2) {
				c = parseInt(a.substr(j, 2), 16) ^ r;
				s += String.fromCharCode(c);
			}

			e.attr('href', 'mailto:' + s);
			e.find('script').remove();
			
			var span = e.find('.__cf_email__');

			if (!!span.length) {
				e = span;
			}

			if (PATTERN.test(str.trim(e.text()))) {
				e.text(s);
			}
		}
	};

	var doIt = function () {
		$(SELECTOR).each(function (i, e) {
			try {
				e = $(e);
				var a = e.attr('data-cfemail');

				if (!a) {
					a = e.attr('href').split('#')[1];
				}

				if (a && a.indexOf('?') !== -1) {
					a = a.split('?')[0];
				}

				if (a) {
					process(a, e);
				}
			} catch (ex) {
				App.log(ex);
			}
		});
	};

	var actions = function () {
		return {
			page: {
				enter: doIt
			},
			articleChanger: {
				enter: doIt
			}
		};
	};
	
	App.modules.exports('cloudflare-email', {
		actions: actions
	});
	
})(jQuery, window.s, window);

/**
 *  @author Deux Huit Huit
 *
 *  Defered css
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

/**
 *  @author Deux Huit Huit
 *
 *  Facebook
 */
(function ($, undefined) {
	'use strict';
	
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
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Format twitter
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var twitterlink = function (t) {
		return t.replace(/[a-z]+:\/\/([a-z0-9-_]+\.[a-z0-9-_:~\+#%&\?\/.=^>^<]+[^:\.,\)\s*$])/gi,
			function (m, link) {
				return '<a title="' + m + '" href="' + m + '" target="_blank" rel="noopener">' +
					((link.length > 36) ? link.substr(0, 35) + '&hellip;' : link) + '</a>';
			}
		);
	};
	
	var twitterat = function (t) {
		return t.replace(
/(^|[^\w]+)\@([a-zA-Z0-9_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]{1,15}(\/[a-zA-Z0-9-_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)*)/gi, // jshint ignore:line
			function (m, m1, m2) {
				return m1 + '<a href="http://twitter.com/' + m2 +
					'" target="_blank" rel="noopener">@' + m2 + '</a>';
			}
		);
	};
	
	var twitterhash = function (t) {
		return t.replace(/(^|[^&\w'"]+)\#([a-zA-Z0-9_àáâãäåçèéêëìíîïðòóôõöùúûüýÿ^"^<^>]+)/gi,
			function (m, m1, m2) {
				return m.substr(-1) === '"' || m.substr(-1) == '<' ?
					m : m1 + '<a href="https://twitter.com/search?q=%23' + m2 +
						'&src=hash" target="_blank rel="noopener"">#' + m2 + '</a>';
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
 *  @author Deux Huit Huit
 *
 *  Links modules
 *     Makes all external links added into the dom load in a new page
 *     Makes all internal links mapped to the mediator
 *
 *  ACTIONS
 *      pages.loaded
 *
 */
(function ($, undefined) {
	
	'use strict';
	var loc = window.location;
	var origin = loc.origin || (loc.protocol + '//' + loc.hostname);
	var originRegExp = new RegExp('^' + origin, 'i');
	var otherLangs = (function () {
		var h = $('html');
		var l = h.attr('lang');
		if (!l) {
			return null;
		}
		var d = h.attr('data-all-langs');
		if (!d) {
			return null;
		}
		var validLang = function (lang) {
			return !!lang && lang !== l;
		};
		var createRegxp = function (lang) {
			return new RegExp('^\/' + lang + '\/.*$', 'i');
		};
		return _.map(_.filter(d.split(','), validLang), createRegxp);
	})();
	
	var mustIgnore = function (t, e) {
		// ignore click since there are no current page
		if (!App.mediator._currentPage()) {
			return true;
		}

		var href = t.attr('href');
		if (href === undefined) {
			return true;
		}

		// ignore click since it's not http
		if (/^(mailto|skype|tel|fax|ftps?|#)/im.test(href)) {
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
		var testRegexp = function (r) {
			return r.test(href);
		};
		
		// basic validity
		if (mustIgnore(t, e)) {
			return true;
		}
		
		// query string only href
		if (/^\?.+/.test(href)) {
			href = window.location.pathname + href;
		}

		// full absolute url
		if (originRegExp.test(href)) {
			href = href.replace(originRegExp, '');
		}

		// other language url
		if (!!otherLangs && _.some(_.map(otherLangs, testRegexp))) {
			return true;
		}

		App.mediator.notify('links.gotoClicked', {
			item: t,
			url: href
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
		init: init
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Dailymotion provider
 *
 *  REQUIRES:
 *      https://api.dmcdn.net/all.js
 */

(function ($, global, undefined) {

	'use strict';
	
	var DM = function () {
		return !!window.DM ? window.DM.player : false;
	};
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var dailymotionProvider = $.extend({}, abstractProvider, {
			getIframe: function (url,autoplay, container) {
				App.loaded(DM, function (playerFactory) {
					var id = url.indexOf('/video/') > 0 ?
						url.substring(url.indexOf('/video/') + 7, url.indexOf('_')) :
						url.substring(url.lastIndexOf('/'));
					var div = $('<div/>');
					autoplay = autoplay !== undefined ? autoplay : 1;
					
					container.append(div);
					this.playerInstance = playerFactory(div.get(0), {
						video: id,
						height: '100%',
						width: '100%',
						params: {
							autoplay: autoplay,
							logo: 0,
							info: 0,
							background: '181818',
							highlight: 'b4b4b4',
							api: 1,
							html: 1
						}
					});
				});
			},
			play: function (container) {
				this.playerInstance.play();
			},
			pause: function (container) {
				this.playerInstance.pause();
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Dailymotion',
			provider: dailymotionProvider
		});
	};
	
	App.modules.exports('oembed-dm', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Facebook provider
 *
 *  REQUIRES:
 *      https://connect.facebook.net/en_US/sdk.js#xfbml=1&amp;version=v2.3
 *      <div id="fb-root"></div> in the body
 */
(function ($, global, undefined) {

	'use strict';
	
	var XFBML = function () {
		return !!window.FB && window.FB.XFBML;
	};
	
	var init = function () {
		var abstractProvider;
		if (!$('#fb-root').length) {
			App.log({
				fx: 'error',
				args: 'The FB SDK requires <div id="fb-root"></div> in the body'
			});
		}
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var facebookProvider = $.extend({}, abstractProvider, {
			embed: function (container, id) {
				App.loaded(XFBML, function (XFBML) {
					XFBML.parse(container.get(0) || document, function () {
						App.callback(facebookProvider.ready);
					});
				});
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Facebook',
			provider: facebookProvider
		});
	};
	
	App.modules.exports('oembed-fb', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Instagram provider
 *
 *  REQUIRES:
 *      https://platform.instagram.com/en_US/embeds.js
 */

(function ($, global, undefined) {

	'use strict';
	
	var instgrm = function () {
		return !!window.instgrm && window.instgrm.Embeds;
	};
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var instagramProvider = $.extend({}, abstractProvider, {
			embed: function (container, id) {
				var html = abstractProvider.getTemplateContent(container);
				if (!!html) {
					container.html(html);
				}
				App.loaded(instgrm, function (Embeds) {
					Embeds.process();
				});
				return !html ? undefined : container.children();
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Instagram',
			provider: instagramProvider
		});
	};
	
	App.modules.exports('oembed-ig', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Soundcloud provider
 */

(function ($, global, undefined) {

	'use strict';
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var soundcloudProvider = $.extend({}, abstractProvider, {
			embed: function (container, id) {
				var html = abstractProvider.getTemplateContent(container);
				container.html(html);
				return container.children();
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Soundcloud',
			provider: soundcloudProvider
		});
	};
	
	App.modules.exports('oembed-sc', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Twitter provider
 *
 *  REQUIRES:
 *      https://platform.twitter.com/widgets.js
 */

(function ($, global, undefined) {

	'use strict';
	
	var widgets = function () {
		return !!window.twttr && window.twttr.widgets;
	};
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var twitterProvider = $.extend({}, abstractProvider, {
			embed: function (container, id) {
				App.loaded(widgets, function (widgets) {
					widgets.load(container.get(0) || document);
				});
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Twitter',
			provider: twitterProvider
		});
	};
	
	App.modules.exports('oembed-tw', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Vimeo provider
 *
 *  REQUIRES:
 *      https://f.vimeocdn.com/js/froogaloop2.min.js
 */

(function ($, global, undefined) {

	'use strict';
	
	var $f = function () {
		return global.$f;
	};
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var vimeoProvider = $.extend({}, abstractProvider, {
			getIframe: function (id, autoplay, loop, rel, extra) {
				autoplay = autoplay !== undefined ? autoplay : 1;
				loop = loop !== undefined ? loop : 1;
				
				return abstractProvider.getIframe()
					.attr('src', '//player.vimeo.com/video/' + id +
							'?autoplay=' + autoplay + '&loop=' + loop +
							'&api=1&html5=1&rel=' + rel + (extra || ''));
			},
			
			ready: function (container, callback) {
				App.loaded($f, function ($f) {
					var player = $f($('iframe', container).get(0));
					
					player.addEvent('ready', function () {
						if (container.attr('data-volume')) {
							player.api('setVolume', parseInt(container.attr('data-volume'), 10));
						}
						App.callback(callback, [player]);
					});
				});
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
			},

			progress: function (container, callback) {
				App.loaded($f, function ($f) {
					var player = global.$f($('iframe', container).get(0));
					player.addEvent('playProgress', function (e) {
						App.callback(callback, [e.percent * 100]);
					});
				});
			},

			finish: function (container, callback) {
				App.loaded($f, function ($f) {
					var player = global.$f($('iframe', container).get(0));
					player.addEvent('finish', function () {
						App.callback(callback, {
							container: container
						});
					});
				});
			},
			
			volume: function (container, value) {
				App.loaded($f, function ($f) {
					var player = global.$f($('iframe', container).get(0));
					player.api('setVolume', value);
				});
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'Vimeo',
			provider: vimeoProvider
		});
	};
	
	App.modules.exports('oembed-vm', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  oEmbed Youtube provider
 *
 *  REQUIRES:
 *      https://www.youtube.com/iframe_api
 */

(function ($, global, undefined) {

	'use strict';
	
	var YT = function () {
		return !!global.YT ? global.YT.Player : false;
	};
	
	var init = function () {
		var abstractProvider;
		App.modules.notify('oembed.providers.abstract', function (key, p) {
			abstractProvider = p;
		});
		var youtubeProvider = $.extend({}, abstractProvider, {
			getIframe: function (url, autoplay, loop, rel, extra) {
				var id = url.indexOf('v=') > 0 ?
					url.match(/v=([^\&]+)/mi)[1] : url.substring(url.lastIndexOf('/'));
				var autoPlay = autoplay !== undefined ? autoplay : 1;
				var iframe = abstractProvider.getIframe()
					.attr('id', 'youtube-player-' + id)
					.attr('src', '//www.youtube.com/embed/' + id +
						'?feature=oembed&autoplay=' + autoPlay +
						'&enablejsapi=1&version=3&html5=1&rel=' + rel + (extra || ''));
				
				App.loaded(YT, function (Player) {
					youtubeProvider.ytplayer = new Player(iframe.get(0));
				});
				
				return iframe;
			},
			
			playerLoaded: function () {
				return youtubeProvider.ytplayer && youtubeProvider.ytplayer.playVideo;
			},
			
			ready: function (container, callback) {
				App.loaded(YT, function (Player) {
					App.callback(callback, [Player]);
				});
			},
			
			play: function (container) {
				App.loaded(YT, function (Player) {
					App.loaded(youtubeProvider.playerLoaded, function () {
						youtubeProvider.ytplayer.playVideo();
					});
				});
			},
			
			pause: function (container) {
				App.loaded(YT, function (Player) {
					App.loaded(youtubeProvider.playerLoaded, function () {
						youtubeProvider.ytplayer.pauseVideo();
					});
				});
			},

			progress: function (container, callback) {
				var timeout = 0;
				var tick = function () {
					clearTimeout(timeout);
					if (!!youtubeProvider.ytplayer) {
						var duration = youtubeProvider.ytplayer.getDuration();
						var played = youtubeProvider.ytplayer.getCurrentTime();
						App.callback(callback, [Math.max(0, (played / duration) * 100 || 0)]);
					}
					timeout = setTimeout(tick, 2000);
				};
				var onStateChange = function (newState) {
					if (newState.data === global.YT.PlayerState.PLAYING) {
						tick();
					}
					else {
						clearTimeout(timeout);
						timeout = 0;
					}
				};
				App.loaded(YT, function (Player) {
					App.loaded(youtubeProvider.playerLoaded, function () {
						youtubeProvider.ytplayer.addEventListener('onStateChange', onStateChange);
					});
				});
			},

			finish: function (container, callback) {
				var onStateChange = function (newState) {
					if (newState.data === global.YT.PlayerState.ENDED) {
						App.callback(callback, {
							container: container
						});
					}
				};
				App.loaded(YT, function (Player) {
					App.loaded(youtubeProvider.playerLoaded, function () {
						youtubeProvider.ytplayer.addEventListener('onStateChange', onStateChange);
					});
				});
			}
		});
		App.modules.notify('oembed.providers.register', {
			key: 'YouTube',
			provider: youtubeProvider
		});
	};
	
	App.modules.exports('oembed-yt', {
		init: init
	});
	
})(jQuery, window);

/**
 *  @author Deux Huit Huit
 *
 *  Page load error
 */
(function ($, undefined) {

	'use strict';

	var defaultLoadFatalError = function (key, data) {
		if (data && data.url) {
			//Full reload url
			document.location = data.url;
		} else {
			//Should never append from the framework event
			document.location = document.location;
		}
	};
	
	var actions = function () {
		return {
			pages: {
				failedtoparse: function (key, data) {
					
				},
				loaderror: function (key, data) {
					
				},
				loadfatalerror: function (key, data) {
					defaultLoadFatalError(key, data);
				}
			}
		};
	};
	
	var PageLoadErrors = App.modules.exports('page-load-errors', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Page load
 *      Allow animating a progress bar during ajax request.
 *      Use load progress if available, reverts to good old timer if not.
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
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Page not found
 */
(function ($, undefined) {

	'use strict';
	
	var actions = function () {
		return {
			pages: {
				notfound: function (key, data) {
					if (!!data && !!data.url && data.url !== document.location.pathname) {
						document.location = data.url;
					}
				}
			}
		};
	};
	
	var PageNotFound = App.modules.exports('page-not-found', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  popup
 */
(function ($, undefined) {
	
	'use strict';
	
	var ANIM_STATE = 'popup-poped';
	var POPUP_SELECTOR = '.js-popup';
	var BG_SELECTOR = '.js-popup-bg';
	var RESET_ON_CLOSE_ATTR = 'data-popup-reset-on-close';
	
	var toggleAnimInited = function (action, popup) {
		popup.addClass('noanim');
		App.modules.notify('changeState.update', {
			item: popup,
			action: action,
			state: ANIM_STATE
		});
		popup.height();
		popup.removeClass('noanim');
	};
	
	var toggleAnim = function (action, popup) {
		App.modules.notify('changeState.update', {
			item: popup,
			action: action,
			state: ANIM_STATE
		});
	};
	
	var openPopup = function (key, data) {
		var popup = $(data.popup);
		var bg = popup.find(BG_SELECTOR);
		var isAlreadyPopep = popup.hasClass('is-' + ANIM_STATE);
		
		// prepare anim
		toggleAnimInited('off', popup);
		// callback to do things just before animating the popup
		App.callback(data.openCallback);
		
		if (!isAlreadyPopep) {
			$.removeFromTransition(bg.selector);
			bg.transitionEnd(function () {
				// callback to do things just after animating the popup
				App.callback(data.openedCallback, [{
					popup: popup
				}]);
			});
			// do the anim
			toggleAnim('on', popup);
		}
	};
	
	var closePopup = function (key, data) {
		var popup = $(data.popup);
		var bg = popup.find(BG_SELECTOR);
		var isAlreadyPopep = popup.hasClass('is-' + ANIM_STATE);
		
		if (isAlreadyPopep) {
			// return to riginal state once anim is done
			$.removeFromTransition(bg.selector);
			bg.transitionEnd(function () {
				
				//Reset on close if enabled
				if (popup.filter('[' + RESET_ON_CLOSE_ATTR + ']').length) {
					toggleAnimInited('on', popup);
				}
				
				// callback to do things just after animating the popup
				App.callback(data.closeCallback, [{
					popup: popup
				}]);
			});
			
			//do the anim
			toggleAnim('off', popup);
		}
	};
	
	var togglePopup = function (key, data) {
		var isAlreadyPopep = $(data.popup).hasClass('is-' + ANIM_STATE);
		
		if (isAlreadyPopep) {
			//popup is opened and we want to close
			closePopup('', data);
		} else {
			openPopup('', data);
		}
	};
	
	var actions = function () {
		return {
			popup: {
				open: openPopup,
				close: closePopup,
				toggle: togglePopup
			}
		};
	};
	
	App.modules.exports('popup', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Route not found
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
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var siteLoader = $('#site-loader');
	var html = $('html');
	
	var getParam = function (p) {
		var match = new RegExp('[?&]' + p + '=([^&]*)').exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	};
	
	var setCookie = function (name, value, days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = '; expires=' + date.toGMTString();
		document.cookie = name + '=' + value + expires + ';path=/';
	};
	
	var storeIdInCookie = function () {
		var gclid = getParam('gclid');
		
		if (gclid) {
			var gclsrc = getParam('gclsrc');
			if (!gclsrc || gclsrc.indexOf('aw') !== -1) {
				setCookie('gclid', gclid, 90);
			}
		}
	};
	
	var setIdFromCookie = function (key, data) {
		var regEx = new RegExp('(?:^|;\\s*)gclid=([^;]*)').exec(document.cookie);
		if (!!regEx) {
			var id = !!regEx[1] ? regEx[1] : '';
			
			if (!!data.input) {
				data.input.attr('value', id);
			}
		}
	};
	
	var init = function () {
		storeIdInCookie();
	};
	
	var actions = function () {
		return {
			salesforceAdwords: {
				setId: setIdFromCookie
			}
		};
	};
	
	App.modules.exports('salesforce-adwords', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Share This
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
		$(o.element).on(App.device.events.click, function (e) {
			return window.pd(e, false);
		});
	};
	
	var init = function () {
		
	};
	
	var actions = {
		shareThis: {
			applyButton: onApplyButton
		}
	};
	
	var Menu = App.modules.exports('shareThis', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Site Error
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
 */
(function ($, undefined) {

	'use strict';

	var win = $(window);
	var SELECTOR = '.js-site-loader';

	var siteLoaderPanel = $(SELECTOR);

	var destroyLoader = function () {
		siteLoaderPanel.remove();
		App.modules.notify('siteLoader.finished');
	};

	var closeLoader = function () {
		App.modules.notify('siteLoader.closing');
		if (!!siteLoaderPanel.length) {

			$('.js-site-loader-close-ended-anim-ref').transitionEnd(destroyLoader);

			App.modules.notify('changeState.update', {
				item: siteLoaderPanel,
				state: 'close',
				action: 'on'
			});
		}
	};

	var pageLoaded = function () {
		App.modules.notify('siteLoader.pageLoaded');
		if (!!siteLoaderPanel.length) {
			setTimeout(closeLoader, 1000);
		}
	};

	/*********************** INIT */
	var init = function () {
		App.modules.notify('siteLoader.initing');
		if (App.debug()) {
			App.modules.notify('siteLoader.closing');
			destroyLoader();
		} else {
			setTimeout(closeLoader, 9500);
		}
	};
	
	var actions = function () {
		return {
			site: {
				loaded: pageLoaded
			}
		};
	};

	App.modules.exports('site-loader', {
		init: init,
		actions: actions
	});

})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Site nav link selector
 */
(function ($, undefined) {
	
	'use strict';

	var BTN_SELECTOR = '.js-site-nav-link';
	var SELECTED_CLASS = 'is-selected';
	var site = $('#site');
	
	var updateSelectedLink = function (newKey) {
		var newBtn = site.find(BTN_SELECTOR + '.btn-' + newKey);

		//Remove Selected state on all node
		site.find(BTN_SELECTOR + '.' + SELECTED_CLASS)
			.not(newBtn)
			.each(function () {

				//Remove is selected state
				var t = $(this);
				App.modules.notify('changeState.update', {
					item: t,
					state: 'selected',
					action: 'off'
				});
			});

		//Add class
		newBtn.each(function () {
			var t = $(this);

			App.modules.notify('changeState.update', {
				item: t,
				state: 'selected',
				action: 'on'
			});
		});
	};
	
	var onEntering = function (key, data) {
		//check page
		var newPage = $(data.page.key());
		updateSelectedLink(data.page.key().substring(1));
	};
	
	var actions = function () {
		return {
			page: {
				entering: onEntering
			}
		};
	};
	
	App.modules.exports('site-nav-link-selector', {
		actions: actions
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 */
(function ($, undefined) {
	
	'use strict';

	var win = $(window);
	var site = $('#site');
	var isPopState = false;
	var popData = null;

	var onPopState = function (key, data) {
		popData = data;
		isPopState = true;
	};

	var updateScroll = function (key, data) {
		if (data.state.scrollPos) {
			win.scrollTop(data.state.scrollPos);
			App.mediator.notify('site.scroll');
			App.mediator.notify('site.postscroll');
		}
	};

	var onPageEnter = function () {
		if (isPopState) {
			isPopState = false;
			updateScroll(null, popData);
		}
	};

	var init = function () {
		if (history.scrollRestoration) {
			history.scrollRestoration = 'manual';
		}

		site.on($.click, 'a[href^=\'#\']', function (e) {
			var newUrl = document.location.pathname + document.location.search;
			newUrl += $(this).attr('href');
			App.mediator.goto(newUrl);
			return window.pd(e);
		});
	};

	var actions = function () {
		return {
			history: {
				popState: onPopState
			},
			page: {
				enter: onPageEnter
			}
		};
	};
	
	App.modules.exports('siteScrollKeeper', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Site scroll
 *      Site scrollBar add-remove with scrollbar size fix algo
 *      (pad, right, margin)
 *
 *  Use .js-fix-scroll
 *      -pad : Add/remove padding-right scrollbar size fix
 *      -right : Add/remove right scrollbar size fix
 *      -margin : Add/remove margin-right scrollbar size fix
 */
(function ($, undefined) {

	'use strict';
	
	var win = $(window);
	var html = $('html');
	
	var fixScroll = function (value) {
		$('.js-fix-scroll-pad').css({paddingRight: value || ''});
		$('.js-fix-scroll-right').css({right: value || ''});
		$('.js-fix-scroll-margin').css({marginRight: value || ''});
	};
	
	var addScroll = function () {
		html.removeClass('no-scroll');
		fixScroll(0);
	};
	
	var removeScroll = function () {
		if (!html.hasClass('no-scroll')) {
			var x = win.width();
			html.addClass('no-scroll');
			fixScroll(win.width() - x);
		}
	};
	
	var init = function () {
		
	};
	
	var actions = function () {
		return {
			site: {
				removeScroll: removeScroll,
				addScroll: addScroll
			}
		};
	};

	App.modules.exports('siteScroll', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Module Slide
 *
 *
 *  ATTRIBUTES :
 *      (OPTIONAL)
 *      - data-{state}-state-add-class : List of class added when state goes on
 *      - data-{state}-state-rem-class : List of class removed when state goes on
 *
 *      - data-{state}-state-follower : List of selector separated by ','
 *      - data-{state}-state-follower-common-ancestor (if not present: this will be used)
 *
 *      - data-{state}-state-notify-on: custom list of notification separated by ','
 *             called when switching state to on. Data passed : {item:this}
 *      - data-{state}-state-notify-off: custom list of notification separated by ','
 *             called when switching state to off. Data passed : {item:this}
 *
 *  NOTIFY IN :
 *      - slide.update
 *          {item,state,flag}
 *
 *
 *  NOTIFY OUT :
 *      - changeState.begin
 *          {item,state,flag}
 *      - changeState.end
 *          {item,state,flag}
 *
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);

	var processItem = function (item, state, action, callbacks) {
		var flagClass = 'is-' + state;
		var curBoolState = item.hasClass(flagClass);
		var dur = item.attr('data-' + state + '-state-slide-duration') || 300;
		var onCallback = item.attr('data-' + state + '-state-notify-on-callback');

		callbacks = callbacks ? callbacks : {};

		if (action === 'toggle') {
			// set flag class
			App.modules.notify('changeState.update', {
				item: item,
				state: state,
				action: 'toggle'
			});
			
			var fx = !!curBoolState ? 'slideUp' : 'slideDown';
			
			item.stop(true, false)[fx](dur, function () {
				item.css({
					overflow: '',
					height: '',
					marginTop: '',
					marginBottom: '',
					paddingTop: '',
					paddingBottom: ''
				});
				
				if (fx === 'slideDown' && !!onCallback) {
					App.mediator.notify(onCallback, {
						item: item
					});
				}
			});
		} else if (action === 'up') {
			if (!!curBoolState) {
				// set flag class
				App.modules.notify('changeState.update', {
					item: item,
					state: state,
					action: 'off'
				});
				
				item.stop(true, false).slideUp(dur, function () {
					item.css({
						overflow: '',
						height: '',
						marginTop: '',
						marginBottom: '',
						paddingTop: '',
						paddingBottom: ''
					});
				});
			}
		} else if (action === 'down') {
			if (!curBoolState) {
				// set flag class
				App.modules.notify('changeState.update', {
					item: item,
					state: state,
					action: 'on'
				});
				
				item.stop(true, false).slideDown(dur, function () {
					item.css({
						overflow: '',
						height: '',
						marginTop: '',
						marginBottom: '',
						paddingTop: '',
						paddingBottom: ''
					});
					
					App.mediator.notify(onCallback, {
						item: item
					});
				});
			}
		} else {
			App.log('Action: ' + action +
				' is not recognized: Actions available are : toggle, up, down');
		}
	};

	var onUpdateState = function (key, data) {
		if (data && data.item && data.state && data.action) {
			var minWidth = data.item.attr('data-' + data.state + '-state-min-width');
			var maxWidth = data.item.attr('data-' + data.state + '-state-max-width');
			var isMinWidthValid = (!!minWidth && window.mediaQueryMinWidth(minWidth)) || !minWidth;
			var isMaxWidthValid = (!!maxWidth && window.mediaQueryMaxWidth(maxWidth)) || !maxWidth;
			
			if (isMinWidthValid && isMaxWidthValid) {
				processItem(data.item, data.state, data.action, data.callbacks);
			}
		}
	};
	
	var actions = function () {
		return {
			slide: {
				update: onUpdateState
			}
		};
	};
	
	App.modules.exports('slide', {
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Title Updater
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
		pages: {
			loaded: onPageLoaded
		},
		page: {
			enter: onEnter
		},
		articleChanger: {
			loaded: onPageLoaded,
			enter: onEnter
		}
	};
	
	var TitleUpdater = App.modules.exports('titleUpdater', {
		init: init,
		actions: function () {
			return actions;
		}
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Toggle no previous url
 *     Go to homepage if no previous url are found
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
			page: {
				toggleNoPreviousUrl: onToggleNoPreviousUrl
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
 *  @author Deux Huit Huit
 *
 *  Transition Modules
 *
 *  Listens to
 *
 *  -
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
			pageTransitionAnimation: {
				getTargetPage: function (key, data, e) {
					if (!data) {
						data = {
							result: {}
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
	
	var exportsTransition = function (options) {
		var o = $.extend({
			from: '*',
			to: '*',
			beginTransition: defaultBeginTransition,
			transition: defaultTransition,
			canAnimate: function () {
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
		actions: actions
	});
	
	/* Public Interfaces */
	window.App = $.extend(window.App, {
		transitions: {
			exports: exportsTransition
		}
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  TransitionEnd notify
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);

	var onCancel = function (key, data) {
		if (data && data.item) {
			$.removeFromTransition(data.item.selector);
		}
	};

	var onAttach = function (key, data) {
		if (data && data.item) {
			var notifyEnd = data.item.attr('data-transitionEnd-notify');
			if (notifyEnd && notifyEnd.length) {
				data.item.transitionEnd(function () {
					App.mediator.notify(notifyEnd, {item: data.item});
				});
			}
		}
	};
	
	var actions = function () {
		return {
			transitionEndNotify: {
				attach: onAttach,
				cancel: onCancel
			}
		};
	};
	
	App.modules.exports('transitionEnd-notify', {
		actions: actions
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
			currentQsFragment = App.routing.querystring.parse(
				currentPageFragment.substring(QSIndex)
			);
		} else {
			currentQsFragment = {};
		}
	};

	var onReplaceState = function (key, data) {
		var innerData = {
			scrollPos: $(window).scrollTop()
		};

		window.history.replaceState($.extend({}, innerData, data.data), data.title, data.url);
	};

	var onPagesLoading = function () {
		if (!isPopingState) {
			onReplaceState(null, {
				title: document.title,
				url: currentPageRoute + currentPageFragment
			});
		}
	};

	var historyPush = function (url) {
		history.pushState({}, document.title, url);
	};

	var updateUrlFragment = function () {
		historyPush(currentPageRoute + currentPageFragment);
	};
	
	var getNextRouteFromData = function (data) {
		var result = data.page.routes()[0];
		if (data.page.routes().length > 1) {
			result = data.page.routes()[getLanguageIndex()];
		}
		return result;
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
				historyPush(newRoute + currentPageFragment);
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
		} else {
			$.sendPageView({page: data.route});
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
			var oldQsFragmentString = App.routing.querystring.stringify(currentQsFragment);

			//Update currentQsFragment
			$.extend(currentQsFragment, options.qs);
			
			var currentUrlWithoutHash = currentPageFragment.split('#')[0];
			var currentHash = currentPageFragment.split('#')[1];

			var currentQsIndex = currentPageFragment.indexOf('?'),
			newQsString = generateQsString();
			
			if (('?' + newQsString) !== oldQsFragmentString) {
				//Generate new page fragment
				if (!newQsString.length) {

					//Trim all existing qs
					if (currentQsIndex !== -1) {
						currentPageFragment = currentUrlWithoutHash.split('?')[0];
					}
				} else if (currentQsIndex === -1) {
					currentPageFragment = currentUrlWithoutHash + '?' + newQsString;

				} else {
					currentPageFragment = currentUrlWithoutHash.substring(0, currentQsIndex + 1) +
						newQsString;
				}

				//Append back hash value
				if (currentHash && currentHash.length) {
					currentPageFragment += '#' + currentHash;
				}

				// currentPage
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
	
	var throttledScroll = _.throttle(function () {
		onReplaceState(null, {
			title: document.title,
			url: document.location.pathname + document.location.search + document.location.hash
		});
	}, 500, {});
	
	var onScroll = function () {
		throttledScroll();
	};
	
	var init = function () {
		//Init langs arrays
		var html = $('html');
		var languages = html.attr('data-all-langs');
		if (!!languages) {
			langs = languages.split(',');
		}

		if (window.history.pushState) {
			$(window).on('popstate', function (e) {

				App.modules.notify('history.popState', {
					previousUrl: currentPageUrl,
					event: e,
					state: e.originalEvent.state
				});
				urlChanged();
			});
		} else {
			App.log({
				fx: 'error',
				msg: 'Cannot update url : history api was not found'
			});
		}
	};
	
	var actions = function () {
		return {
			site: {
				scroll: onScroll
			},
			page: {
				entering: onPageEntering,
				leaving: onPageLeaving,
				enter: onPageEntered,
				updateUrlFragment: onUpdateUrlFragment,
				updateQsFragment: onUpdateQsFragment,
				replaceState: onReplaceState
			},
			pages: {
				navigateToCurrent: onNavigateToCurrent,
				loading: onPagesLoading
			},
			url: {
				getUrl: function () {
					return window.location.pathname;
				},
				getQueryString: function () {
					return window.location.search;
				},
				getFullUrl: function () {
					return window.location.toString();
				}
			}
		};
	};
	
	var urlChanger = App.modules.exports('urlChanger', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  User id
 */
(function ($, undefined) {

	'use strict';
	
	var LENGTH = 32;
	var HIDDEN_FIELD_SEL = '.js-user-id';
	var storage = window.Storage.local;
	var KEY = 'auto-user-id';
	var uId = '';
	
	var createUid = function () {
		var i = 0;
		var uId = '';
		if (!window.Uint8Array || !window.crypto) {
			for (i = 0; i < LENGTH; ++i) {
				uId += (~~(Math.random() * 10000) % 255).toString(16);
			}
			return uId;
		}
		var randomPool = new window.Uint8Array(LENGTH);
		window.crypto.getRandomValues(randomPool);
		for (i = 0; i < randomPool.length; ++i) {
			uId += randomPool[i].toString(16);
		}
		return uId;
	};

	var init = function () {
		uId = storage.get(KEY) || '';
		if (!uId) {
			uId = createUid();
			storage.set(KEY, uId);
		}
	};

	var update = function () {
		if (!uId) {
			return;
		}
		$(HIDDEN_FIELD_SEL).val(uId);
	};

	var actions = function () {
		return {
			page: {
				enter: update
			},
			articleChanger: {
				enter: update
			}
		};
	};

	App.modules.exports('auto-cycle', {
		init: init,
		actions: actions
	});
	
})(jQuery);

/**
 *  @author Deux Huit Huit
 *
 *  Window Notifier
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
	
	var readyHandler = function (e) {
		notify('ready', e);
	};
	
	var init = function () {
		$(readyHandler);
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

	var requestScrollTop = function (key, data) {
		if (!data || !data.animated) {
			win.scrollTop(0);
			scrollHandler();
		}
	};

	var actions = function () {
		return {
			window: {
				scrollTop: requestScrollTop
			}
		};
	};
	
	var WindowNotifier = App.modules.exports('windowNotifier', {
		init: init,
		actions: actions
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
	
	var completeAnim = function (data, callback) {
		var bgTransition = $('#bg-transition', body);
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		//Leave the current page
		leavingPage.leave(data.leaveCurrent, {
			canRemove: true
		});
		
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
			App.modules.notify('page.leaving', {
				page: leavingPage,
				canRemove: true
			});
			
			win.scrollTop(0);
		
			domLeavingPage.hide();
			beginCompleted = true;
			
			if (loadCompleted) {
				completeAnim(dataIn);
			}
		});
	};
	
	var defaultTransition = function (data, callback) {
		loadCompleted = true;
		dataIn = data;
		if (beginCompleted) {
			completeAnim(data, callback);
		}
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
 * Default page transition
 *
 */
(function ($, undefined) {
	
	'use strict';
	
	var win = $(window);
	var body = $('body');
	var sitePages = $('#site-pages');
	var bgTransition = $('#bg-transition');
	var bgTransitionPopup = $('#bg-transition-popup');
	var DEFAULT_DELAY = 350;
	var POPUP_SELECTOR = '.js-popup';
			
	var beginCompleted = false;
	var loadCompleted = false;

	var dataIn = null;
	
	/* ENTERING FUNCTIONS */
	var completeAnim = function (data, callback) {
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		var popup = domEnteringPage.find(POPUP_SELECTOR);
		
		//Leave the current page
		leavingPage.leave(
			data.leaveCurrent,
			{
				canRemove: false
			}
		);
		
		body.addClass(enteringPage.key().substring(1));
		
		//Notify intering page
		App.modules.notify('page.entering', {page: enteringPage, route: data.route});
		
		//Animate leaving and start entering after leaving animation
		//Need a delay for get all Loaded
		domEnteringPage.ready(function () {
			// close popup if already opened
			if (popup.hasClass('is-popup-poped')) {
				popup.addClass('noanim');
				
				App.modules.notify('popup.close', {
					popup: popup
				});
				
				popup.height();
				popup.removeClass('noanim');
			}
			
			App.modules.notify('popup.open', {
				popup: popup,
				openCallback: function () {
					domEnteringPage.css({
						opacity: 1,
						display: 'block',
						position: 'relative'
					}).height();
					enteringPage.enter(data.enterNext);
				},
				openedCallback: function () {
					App.modules.notify('transition.end', {page: enteringPage, route: data.route});
					App.callback(callback);
				}
			});
		});
	};
	
	var defaultBeginTransition = function (data, callback) {
		var leavingPage = data.currentPage;
		var domLeavingPage = $(leavingPage.key());
		
		beginCompleted = false;
		loadCompleted = false;
		dataIn = null;
		
		App.modules.notify('site.removeScroll');
		domLeavingPage.addClass('is-bg-popup-page');

		App.modules.notify('page.leaving', {
			page: leavingPage,
			canRemove: false
		});
		
		bgTransitionPopup.fadeIn(DEFAULT_DELAY).promise().then(function () {
			beginCompleted = true;
			if (loadCompleted) {
				completeAnim(dataIn);
			}
		});
	};
	
	var defaultTransition = function (data, callback) {
		dataIn = data;
		loadCompleted = true;
		if (beginCompleted) {
			completeAnim(data, callback);
		}
	};
	
	/* LEAVING FUNCTIONS */
	var completeLeaveAnim = function (data, callback) {
		var leavingPage = data.currentPage;
		var enteringPage = data.nextPage;
		
		var domEnteringPage = $(enteringPage.key());
		var domLeavingPage = $(leavingPage.key());
		
		var popup = domLeavingPage.find(POPUP_SELECTOR);
		
		var isPopupReturn = domEnteringPage.hasClass('is-bg-popup-page');
		
		//Check if the enteringPage is the background page
		if (!isPopupReturn) {
			//Remove the other pages
			var oldBgPage = sitePages.find('.is-bg-popup-page');
			if (oldBgPage.length) {
				body.removeClass(oldBgPage.attr('id'));
				oldBgPage.remove();
			}
			
			//Add the new class to the body
			body.addClass(enteringPage.key().substring(1));
		}
		
		//Animate leaving and start entering after leaving animation
		//Need a delay for get all Loaded
		domEnteringPage.ready(function () {
			if (!isPopupReturn) {
				win.scrollTop(0);
			}
			
			domEnteringPage.css({opacity: 1, display: 'block'});
			body.removeClass(leavingPage.key().substring(1));
			
			App.modules.notify('page.leaving', {
				page: leavingPage,
				canRemove: true
			});
			
			//Notify intering page
			App.modules.notify('page.entering', {page: enteringPage, route: data.route});
			
			App.modules.notify('popup.close', {
				popup: popup,
				closeCallback: function () {
					App.modules.notify('site.addScroll');
				
					//Leave the current page
					leavingPage.leave(data.leaveCurrent, {
						canRemove: true
					});
					domLeavingPage.hide();

					enteringPage.enter(data.enterNext);
					App.modules.notify('transition.end', {page: enteringPage, route: data.route});
					App.callback(callback);
				}
			});
		});
	};
	
	var endLeavebegin = function () {
		beginCompleted = false;
		loadCompleted = false;
		dataIn = null;
		
		beginCompleted = true;
		if (loadCompleted) {
			completeLeaveAnim(dataIn);
		}
	};
	
	var defaultLeaveBeginTransition = function (data, callback) {
		bgTransitionPopup.fadeOut(200).promise().then(endLeavebegin);
	};
	
	var defaultLeaveTransition = function (data, callback) {
		loadCompleted = true;
		dataIn = data;
		if (beginCompleted) {
			completeLeaveAnim(data, callback);
		}
	};
	
	/*App.transitions.exports({
		from: 'page-search',
		beginTransition: defaultLeaveBeginTransition,
		transition: defaultLeaveTransition,
		canAnimate: function (data) {
			return true;
		}
	});

	App.transitions.exports({
		to: 'page-search',
		beginTransition: defaultBeginTransition,
		transition: defaultTransition,
		canAnimate: function (data) {
			return true;
		}
	});*/
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * BASIC DETAIL PAGE
 *
 */

(function ($, global, undefined) {

	'use strict';
	
	App.pages.exports('default-detail-page', function () {
		var page;
		var changer = App.components.create('articleChanger');
		var isFirstFragment = true;

		var onLeave = function (next, data) {
			if (!!data.canRemove) {
				page.remove();
			}

			App.callback(next);
		};

		var onFragmentChanged = function (key, data) {
			var frag = !!data ? data : '';

			changer.navigateTo(frag.split('/')[0]);
		};
		
		var init = function () {
			page = $(this.key());

			changer.init(page, {
				startPageHandle: page.find('.js-article').attr('data-handle'),
				scrollToTop: true
			});
		};
		
		var actions = function () {
			return {
				page: {
					fragmentChanged: onFragmentChanged
				}
			};
		};
		
		var self = {
			init: init,
			leave: onLeave,
			actions: actions
		};
		
		return self;
	});
	
})(jQuery, window);

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
	
	/* jshint ignore:start */
	0;// @from https://github.com/DeuxHuitHuit/jQuery-Animate-Enhanced/blob/master/scripts/src/jquery.animate-enhanced.js
	/* jshint ignore:end */
	
	var HAS_3D = ('WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix());
	
	var intValue = function (p) {
		return ~~(!p || $.isNumeric(p) ? (p || 0) : p);
	};
	
	var pixelValue = function (p) {
		return !p || $.isNumeric(p) ? ~~(p || 0) + 'px' : p;
	};
	
	var getTranslation = function (x, y, z) {
		x = pixelValue(x);
		y = pixelValue(y);
		z = pixelValue(z);
		
		var prefix = (HAS_3D ? '3d(' : '(');
		var suffix = (HAS_3D ? ',' + z + ')' : ')');
		
		return 'translate' + prefix + x + ',' + y + suffix;
	};
	
	var getRotation = function (x, y, z, theta) {
		x = intValue(x);
		y = intValue(y);
		z = intValue(z);
		theta = !theta || $.isNumeric(theta) ? (theta || 0) + 'deg' : theta;
		
		var prefix = (HAS_3D ? '3d(' + x + ',' + y + ',' + z + ',' : 'Z(');
		var suffix = (HAS_3D ? ')' : ')');
		
		return 'rotate' + prefix + theta + suffix;
	};
	
	global.CSS3 = {
		translate: getTranslation,
		rotate: getRotation,
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
	
	var lang = $('html').attr('lang');
	
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
		App.log({args: ['%cga(' + args.join(',') + ');', 'color:navy']});
	};
	
	var getGa = function () {
		/* jshint ignore:start */
		if (!!window.dataLayer && !!window.dataLayer.push) {
			return function ga (gaAction, gaCat, cat, action, label, value, options, category) {
				if (gaCat === 'pageview') {
					dataLayer.push($.extend({}, cat, {
						event: gaCat,
						page: {
							requestURI: cat.page || cat.location,
							page: cat.page,
							location: cat.location,
							language: lang,
							referer: document.referrer,
							title: document.title
						}
					}));
				} else if (gaCat === 'event') {
					var args = {
						event: gaCat,
						eventCategory: category || cat,
						eventAction: action,
						eventLabel: label,
						eventValue: value,
						eventOptions: options
					};
					if ($.isPlainObject(cat)) {
						args = $.extend(true, {}, args, cat);
						args.eventCategory = args.eventCategory || args.event;
						args.event = gaCat;
					}
					dataLayer.push(args);
				}
			};
		}
		/* jshint ignore:end */
		return window.ga || log;
	};
	
	// ga facilitators
	$.sendPageView = function (opts) {
		var ga = getGa();
		var defaults = {
			page: window.location.pathname + window.location.search,
			location: window.location.href,
			hostname: window.location.hostname
		};
		var args = !opts ? defaults : $.extend(defaults, opts);
		if ($.isFunction($.formatPage)) {
			args.page = $.formatPage(args.page);
		}
		if ($.isFunction($.formatLocation)) {
			args.location = $.formatLocation(args.location);
		}
		ga('send', 'pageview', args);
	};
	
	/* jshint maxparams:6 */
	$.sendEvent = function (cat, action, label, value, options, category) {
		var ga = getGa();
		cat = cat || '';
		options = cat.options || options || {nonInteraction: 1};
		ga('send', 'event', cat, action, label, value, options, category);
	};
	/* jshint maxparams:5 */
	
	$.fn.sendClickEvent = function (options) {
		options = options || {};
		var t = $(this).eq(0);
		var send = true;
		if (!options.action) {
			options.action = 'click';
		}
		if (!options.label) {
			options.label = $.trim(t.text());
		}
		var o = $.extend({}, options, {
			cat: t.attr('data-ga-cat') || undefined,
			category: t.attr('data-ga-category') || undefined,
			action: t.attr('data-ga-action') || undefined,
			label: t.attr('data-ga-label') || undefined,
			value: parseInt(t.attr('data-ga-value'), 10) || undefined
		});
		if (!o.cat) {
			App.log({fx: 'err', args: 'No ga-cat found. Cannot continue.'});
			return;
		}
		if (!o.label) {
			App.log({fx: 'err', args: 'No ga-label found. Reverting to text'});
		}
		if (!!options.event) {
			if (!options.event.gaHandled) {
				options.event.gaHandled = true;
			} else {
				send = false;
			}
		}
		if (!!send) {
			$.sendEvent(o.cat, o.action, o.label, o.value, undefined, o.category);
		}
	};
	
	// auto-hook
	$(function () {
		var loc = window.location;
		var origin = loc.origin || (loc.protocol + '//' + loc.hostname);
		var internalLinksExclusion = ':not([href^="' + origin + '"])';
		var externalLinks = 'a[href^="http://"]' + internalLinksExclusion +
			', a[href^="https://"]' + internalLinksExclusion;
		var mailtoLinks = 'a[href^="mailto:"]';
		var telLinks = 'a[href^="tel:"]';
		var downloadExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xsl', 'xslx'];
		var downloadLinks = _.map(downloadExtensions, function (ext) {
			return 'a[href$=".' + ext + '"], ';
		}).join('') + 'a[href$="?dl"], a[download]';
		var notAlreadyTagged = ':not([data-ga-cat])';
		$('#site').on(App.device.events.click, '[data-ga-cat]', function (e) {
			$(this).sendClickEvent({
				event: e
			});
		})
		.on(App.device.events.click, externalLinks + notAlreadyTagged, function (e) {
			$(this).sendClickEvent({
				cat: 'link-external',
				event: e
			});
		})
		.on(App.device.events.click, downloadLinks + notAlreadyTagged, function (e) {
			$(this).sendClickEvent({
				cat: 'link-download',
				event: e
			});
		})
		.on(App.device.events.click, mailtoLinks + notAlreadyTagged, function (e) {
			$(this).sendClickEvent({
				cat: 'link-mailto',
				event: e
			});
		})
		.on(App.device.events.click, telLinks + notAlreadyTagged, function (e) {
			$(this).sendClickEvent({
				cat: 'link-tel',
				event: e
			});
		});
		if ($('body').hasClass('page-404')) {
			$.sendEvent('erreur 404', 'erreur 404', document.referrer);
		}
	});
	
})(jQuery);

/**
 * @author Deux Huit Huit
 *
 * css3 Transition end
 */

(function ($, undefined) {
	
	'use strict';
	
	var transitionEndEvent = 'transitionend ' +
		'webkitTransitionEnd oTransitionEnd mozTransitionEnd MSTransitionEnd';
	var addClassTimer = 'add-class-timer';
	var queue = [];
	
	var forEachSelectorsInQueue = function (fn) {
		if (!!queue.length) {
			$.each(queue, function eachRemoveFromQueue (index, q) {
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
		
		forEachSelectorsInQueue(function eachInQueue (q, index) {
			
			$.each(q.selectors, function eachCallbackSelector (selector, value) {
				q.selectors[selector] = value || target.is(selector);
			});
			
			// every selectors are on
			if (window._.every(q.selectors)) {
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
			
			forEachSelectorsInQueue(function eachInQueue (q, index) {
				var localFound = false;
				
				if (!!q && !!q.selectors) {
					
					var eachCallbackSelector = function (value, selector) {
						return !!~$.inArray(selector, selectors);
					};
					
					localFound = window._.some(q.selectors, eachCallbackSelector);
					
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
			
			timer = setTimeout(function addClassesTimer (class2, callback, selectors) {
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
			t.transitionEnd(function tEnd () {
				t.removeClass(class1);
				if ($.isFunction(callback)) {
					callback();
				}
			}, selectors);
			t.removeClass(class2);
		});
	};
	
})(jQuery);

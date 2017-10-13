/**
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
		
		var init = function (_ctn) {
			ctn = $(_ctn);
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

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
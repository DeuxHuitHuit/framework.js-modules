/**
 *  @author Deux Huit Huit
 *
 *  Auto state on scroll bounds
 
 	Container: Element that scrolls and on which the state will be changed.
 				It has 4 states, 2 per axis.
 		<add class="js-scroll-bounds-ctn" />
 		<add data-scroll-bounds-threshold="0.1" />
 		
 		<add data-x-start-state-add-class="" />
	 	<add data-x-start-state-rem-class="" />
	 	<add data-x-end-state-add-class="" />
	 	<add data-x-end-state-rem-class="" />
	 	<add data-y-start-state-add-class="" />
	 	<add data-y-start-state-rem-class="" />
	 	<add data-y-end-state-add-class="" />
	 	<add data-y-end-state-rem-class="" />
 	
 	Content: Element that is inside the container and that contains all of the content.
 			 Will be used to evaluate total scrolling width.
 		<add class="js-scroll-bounds" />
 */
(function ($, undefined) {
	
	'use strict';
	var win = $(window);
	var site = $('#site');
	var scrollTimer = 0;
	var resizeTimer = 0;
	
	var elements = $();
	var defaultThreshold = 0;
	
	var SELECTOR_CTN = '.js-scroll-bounds-ctn';
	var SELECTOR_SCROLL = '.js-scroll-bounds';
	
	var ATTR_THRESHOLD = 'data-scroll-bounds-threshold';
	
	var getBounds = function (elems) {
		var b = {
			x: 0,
			y: 0
		};
		
		elems.each(function () {
			var t = $(this);
			var x = t.outerWidth() + t.offset().left;
			var y = t.outerHeight() + t.offset().top;
			
			b.x = Math.max(x, b.x);
			b.y = Math.max(y, b.y);
		});
		
		// Removes everything to the right of the decimal
		b.x = ~~b.x;
		b.y = ~~b.y;
		
		return b;
	};
	
	var computeStates = function (elem) {
		var ctn = elem.closest(SELECTOR_CTN);
		var curX = ~~elem.scrollLeft();
		var curY = ~~elem.scrollTop();
		var elemW = ~~elem.outerWidth();
		var elemH = ~~elem.outerHeight();
		var scrollW = ~~elem.prop('scrollWidth');
		var scrollH = ~~elem.prop('scrollHeight');
		var isScrollableX = scrollW > elemW;
		var isScrollableY = scrollH > elemH;
		var thresholdValue = !!elem.attr(ATTR_THRESHOLD) ?
			parseFloat(elem.attr(ATTR_THRESHOLD)) : defaultThreshold;
		var xThreshold = ~~scrollW * thresholdValue;
		var yThreshold = ~~scrollH * thresholdValue;
		
		var xStartVisible = !isScrollableX || curX <= xThreshold;
		var xEndVisible = !isScrollableX || (scrollW - (curX + elemW)) <= xThreshold;
		var yStartVisible = !isScrollableY || curY <= yThreshold;
		var yEndVisible = !isScrollableY || (scrollH - (curY + elemH)) <= yThreshold;

		if (ctn.length === 0) {
			App.log('Auto state on scroll bounds: No ctn found');
		}
		
		elem.data('scroll-bounds-callback', function () {
			App.modules.notify('changeState.update', {
				item: ctn,
				state: 'x-start',
				action: xStartVisible ? 'on' : 'off'
			});
			App.modules.notify('changeState.update', {
				item: ctn,
				state: 'x-end',
				action: xEndVisible ? 'on' : 'off'
			});
			App.modules.notify('changeState.update', {
				item: ctn,
				state: 'y-start',
				action: yStartVisible ? 'on' : 'off'
			});
			App.modules.notify('changeState.update', {
				item: ctn,
				state: 'y-end',
				action: yEndVisible ? 'on' : 'off'
			});
		});
	};
	
	var updateData = function (elem) {
		App.callback(elem.data('scroll-bounds-callback'));
	};
	
	// SCROLL
	var onElementScroll = function () {
		var t = $(this);
		
		computeStates(t);
		
		window.craf(scrollTimer);
		scrollTimer = window.raf(function () {
			updateData(t);
		});
	};
	
	var refreshElements = function () {
		//detach event on old elements
		elements.off('scroll', onElementScroll);
		
		elements = site.find(SELECTOR_SCROLL);
		
		//attach events on new element
		elements.on('scroll', onElementScroll);
	};

	// RESIZE
	var onResize = function () {
		window.craf(resizeTimer);

		resizeTimer = window.raf(function () {
			elements.each(function () {
				var t = $(this);
				computeStates(t);
				updateData(t);
			});
		});
	};

	// PAGE / ARTICLE CHANGER EVENTS
	var refreshAll = function () {
		refreshElements();
		onResize();
	};
	
	var init = function () {
		onResize();
	};
	
	var actions = function () {
		return {
			site: {
				resize: onResize,
				loaded: onResize
			},
			page: {
				enter: refreshAll
			},
			articleChanger: {
				enter: refreshAll
			},
			autoStateOnScrollBounds: {
				refreshAll: refreshAll
			}
		};
	};
	
	App.modules.exports('auto-state-on-scroll-bounds', {
		init: init,
		actions: actions
	});
	
})(jQuery);

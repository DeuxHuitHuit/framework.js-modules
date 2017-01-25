/**
 * @author Deux Huit Huit
 *
 *  Allow a link or a button to append a key and value in the Querystring.
 *  If used with a link. the href should be corresponding to the js behavior
 *  It Need to be used with data-action="none" or the links modules will also trigger.
 *  It will automatically raise the page.updateQsFragment with the new querystring builded.
 *  If the value is "" then the key will be removed from the QS (Filter all);
 *  Optionnaly you can make a key exclusif by removing other key when setting a key with
 *  the remove-keys attribute
 *
 *  Query string example
 *  ?{key}={value}
 *
 *  SELECTOR :
 *    .js-merge-qs-value-button
 *
 *  ATTRIBUTES :
 *      - data-merge-qs-value-key
 *          Define the key for the querystring )
 *
 *      - data-merge-qs-value
 *          Define the value associated to the key
 *
 *      - data-merge-qs-value-remove-keys
 *          List of keys separated by ','
 *          to be removed when the key-value is set
 *
 *      - data-merge-qs-value-prevent-default
 *          If present. will prevent default
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
		var value = t.attr(VALUE_ATTR);
		var qs = App.routing.querystring.parse(document.location.search);
		
		// Minimal attribute needed for proceeding
		if (!!key) {

			if (t.filter('[' +TOGGLE_KEY_VALUE_ATTR + ']' ).length) {
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

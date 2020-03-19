/**
 * Auto Google Map module
 * @author Deux Huit Huit
 * @requires com/google-map.js
 */
(function ($, undefined) {

	'use strict';

	var scope = $('.page');

	var sels = {
		ctn: '.js-auto-google-map-ctn',
		map: '.js-auto-google-map',
		marker: '.js-auto-google-map-marker',
		styles: '.js-auto-google-map-style'
	};

	var ready = false;

	var DEFAULT_MARKER_WIDTH = 30;
	var DEFAULT_MARKER_HEIGHT = 30;
	var DEFAULT_ZOOM = 10;

	var createMarker = function (element, mapComponent) {
		var lat = element.attr('data-lat');
		var lng = element.attr('data-lng');
		var iconSrc = element.attr('data-icon');
		var iconWidth = parseInt(element.attr('data-icon-width'), 10) || DEFAULT_MARKER_WIDTH;
		var iconHeight = parseInt(element.attr('data-icon-height'), 10) || DEFAULT_MARKER_HEIGHT;

		var config = {
			id: element.attr('data-poi-id'),
			LatLng: new window.google.maps.LatLng(lat, lng),
			content: element.html(),
			iconImage: {
				src: iconSrc,
				size: new google.maps.Size(iconWidth, iconHeight),
				scaledSize: new google.maps.Size(iconWidth, iconHeight),
				p1: {
					x: 0,
					y: 0
				},
				p2: {
					x: iconWidth / 2,
					y: iconHeight / 2
				}
			},
			zIndex: 50
		};

		if (!iconSrc) {
			config.iconImage = undefined;
		}

		var marker = mapComponent.addMarker(config);

		element.data('markerRef', marker);
	};

	var initAllMap = function () {

		if (!ready) {
			return;
		}

		scope.find(sels.ctn).each(function () {
			var t = $(this);

			if (!!t.find(sels.map).data('googleMapComp')) {
				App.log({
					fx: 'warn',
					me: 'AutoGoogleMaps',
					args: 'Component already inited for this map; skipping.'
				});
				return;
			}

			var zoom = !!t.attr('data-zoom') ? parseInt(t.attr('data-zoom'), 10) : DEFAULT_ZOOM;
			var lat = t.attr('data-lat');
			var lng = t.attr('data-lng');
			var markers = t.find(sels.marker);
			var styles = t.find(sels.styles).html();

			if ((!lat || !lng) && !!markers.length) {
				lat = markers.first().attr('data-lat');
				lng = markers.first().attr('data-lng');
			}

			if (!!styles) {
				try {
					styles = JSON.parse(styles);
				} catch (error) {
					App.log({
						me: 'Auto Google Maps',
						args: error,
						fx: 'error'
					});
				}
			}

			if (!!lat && !!lng) {
				var comp = App.components.create('googleMap', {
					zoom: zoom,
					center: {
						latitude: lat,
						longitude: lng
					},
					selectorCtn: sels.map,
					styles: styles || undefined,
					zoomControl: true,
					panControl: true,
					streetViewControl: false,
					mapTypeControl: false,
					scrollwheel: false,
					mapTypeId: 'roadmap',
					draggable: true,
					markerCustomAction: function (event, marker) {
						if (!!marker.attr('data-url')) {
							var win = window.open(marker.attr('data-url'), '_blank');
							win.focus();
						}
					},
					afterCreate: function () {
						//Add pins
						markers.each(function () {
							createMarker($(this), comp);
						});
					}
				});

				// Store comp
				t.data('googleMapComp', comp);
				comp.init(t);
			} else {
				App.log({
					fx: 'error',
					me: 'AutoGoogleMaps',
					args: 'No latitude and/or longitude passed to the map'
				});
			}

		});
	};

	var onPageEnter = function (key, data) {
		scope = $(data.page.key());
		initAllMap();
		ready = true;
	};

	var onArticleEntering = function () {
		initAllMap();
	};

	var onSiteLoaded = function () {
		initAllMap();
		ready = true;
	};

	var actions = function () {
		return {
			site: {
				loaded: onSiteLoaded
			},
			page: {
				enter: onPageEnter
			},
			articleChanger: {
				entering: onArticleEntering
			}
		};
	};

	App.modules.exports('auto-google-map', {
		actions: actions
	});

})(jQuery);

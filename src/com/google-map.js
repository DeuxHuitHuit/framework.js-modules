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

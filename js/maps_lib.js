/*!
 * Searchable Map Template with Google Fusion Tables
 * http://derekeder.com/searchable_map_template/
 *
 * Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 *
 * Date: 12/10/2012
 *
 */

// Enable the visual refresh
google.maps.visualRefresh = true;

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //the encrypted Table ID of your Fusion Table (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "1HaVzTYxCBbpmWyNhBA-e4pS1UxejNoWGq7lrVbLz",

  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyBeh__DDVfvhCYAaWmfFbTUqKH7caa2pFI",

  //name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  locationColumn:     "Location",

  map_centroid:       new google.maps.LatLng(49.283205, -123.120251), //center that your map defaults to
  locationScope:      "vancouver",      //geographical area appended to all address searches
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  searchRadius:       805,            //in meters ~ 1/2 mile
  defaultZoom:        14,             //zoom level when map is loaded (bigger is more zoomed in)
  currLocationIcon:   'images/curr-loc.png',
  eventMarkerIcon:    'images/red-dot.png',
  currentPinpoint:    null,
  
  // coordinates for location jumper
  vancouver_coord:    new google.maps.LatLng(49.283205, -123.120251),
  burnaby_coord:      new google.maps.LatLng(49.227942, -123.001948),
  coquitlam_coord:    new google.maps.LatLng(49.278018, -122.800855),
  surrey_coord:       new google.maps.LatLng(49.186445, -122.823494),

  initialize: function() {
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
	  disableDefaultUI: true
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);

    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });
	
	google.maps.event.addListener(map, 'click', function() {
      MapsLib.hideMenus();
      MapsLib.clearSelectedEvents();
	});
	
    //plot points on map
    MapsLib.plotMap(map);

	// plot current location on map
    var myLatlng = new google.maps.LatLng(49.283205, -123.120251);
    MapsLib.addrMarker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon: MapsLib.currLocationIcon,
      title:"You're here"
    });     
  },

  plotMap: function(map) {
    var query = "SELECT 'Event Name', 'Number of people', Distance, Coordinates, ID FROM " + MapsLib.fusionTableId;
    query = encodeURIComponent(query);
    var gvizQuery = new google.visualization.Query(
      'http://www.google.com/fusiontables/gvizdata?tq=' + query);
    
    gvizQuery.send(function(response) {
      var numRows = response.getDataTable().getNumberOfRows();
      // For each row in the table, create a marker
      for (var i = 0; i < numRows; i++) {
        var eventname = response.getDataTable().getValue(i, 0);
        var size = response.getDataTable().getValue(i, 1);
        var distance = response.getDataTable().getValue(i, 2);
        var stringCoordinates = response.getDataTable().getValue(i, 3);
        var splitCoordinates = stringCoordinates.split(',');
        var lat = splitCoordinates[0];
        var lng = splitCoordinates[1];
        var coordinate = new google.maps.LatLng(lat, lng);
		var id = response.getDataTable().getValue(i, 4);
        MapsLib.createEventMarker(eventname, size, distance, coordinate, id);
      }
    });	
  },
  
  createEventMarker: function(eventname, size, distance, coordinate, id) {
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coordinate,
      icon: new google.maps.MarkerImage('images/labels/' + id +'.png')
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setContent(eventname + '<br>Number of people: ' + size + '<br>Distance: ' + distance + '<br><a href="details.html">' +
      'More...</a>');
      //infoWindow.open(map,marker);
	  
	  $("#collapseOne").collapse('show');
	  MapsLib.clearSelectedEvents();
	  $("#" + id).css("backgroundColor", "LightBlue");
    });
  },

  findMe: function() {
	map.panTo(MapsLib.map_centroid);
	map.setZoom(MapsLib.defaultZoom);
  },
  
  locationJump: function(location) {
    var loc_coord = null;
	if (location == "loc_dt") {
		loc_coord = MapsLib.vancouver_coord;
	} 
	if (location =="loc_burnaby") {
		loc_coord = MapsLib.burnaby_coord;
	}
	if (location == "loc_coquitlam") {
		loc_coord = MapsLib.coquitlam_coord;
	}
	if (location == "loc_surrey") {
		loc_coord = MapsLib.surrey_coord;
	}
	map.panTo(loc_coord);
	map.setZoom(MapsLib.defaultZoom);
  },
  
  hideMenus: function() {
    $("#collapseLoc").collapse('hide');
    $("#collapseOne").collapse('hide');
    $("#menu").collapse('hide');
  },
  
  clearSelectedEvents: function() {
    $(".item").css("backgroundColor", "white");
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  }
}

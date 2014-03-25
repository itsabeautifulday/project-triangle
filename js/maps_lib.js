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
  defaultZoom:        13,             //zoom level when map is loaded (bigger is more zoomed in)
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
    markers = [];
	infowindows = new Array();
    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    google.maps.event.addListener(map, 'click', function() {
        MapsLib.hideMenus();
        MapsLib.closeAll();
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

    MapsLib.plotGradients();	
  },

  setAllMap: function(map){
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  },
  
  closeAll: function(map){
    for (var i=0;i<gradientArray.length;i++) {
      gradientArray[i].setMap(null);
    }
    for (var j = 0; j < infowindows.length; j++) {
      infowindows[j].close();
    }
  },

  plotMap: function(map) {
    MapsLib.setAllMap(null);

    var query = "SELECT 'Event Name', 'Number of people', Distance, Coordinates, ID, gradient FROM " + MapsLib.fusionTableId;
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
        var eventid = response.getDataTable().getValue(i, 4);
		var gradient = response.getDataTable().getValue(i, 5);
        var splitCoordinates = stringCoordinates.split(',');
        var lat = splitCoordinates[0];
        var lng = splitCoordinates[1];
        var coordinate = new google.maps.LatLng(lat, lng);
        MapsLib.createEventMarker(eventid, eventname, size, distance, coordinate, gradient);
      }
    });	
  },
  
  createEventMarker: function(eventid, eventname, size, distance, coordinate, gradient) {
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coordinate,
      icon: new google.maps.MarkerImage('images/labels/' + eventname + '.png')
    });

    markers.push(marker);
    google.maps.event.addListener(marker, 'click', function(event) {
	  MapsLib.closeAll();
      infoWindow.setPosition(coordinate);
      infoWindow.setContent(eventname + '<br>Number of people: ' + size + '<br>Distance: ' + distance 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='eventdetails.html?event="+eventid+"'>Details</a></button> ");
      infoWindow.open(map);
      gradientArray[gradient - 1].setMap(map);
    });
    infowindows[gradient - 1] = infoWindow;
  },

  findTrending: function(){
    MapsLib.setAllMap(null);

    var coord1 = new google.maps.LatLng(49.286035,-123.126975);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord1,
      icon: 'images/sort/3.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord1);
      infoWindow.setContent("MagicShow" + '<br>Number of people: ' + "23" + '<br>Distance: ' + "200m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='MagicShow.html'>details</a></button> ");
      infoWindow.open(map);
    });
    markers.push(marker);

    var coord2 = new google.maps.LatLng(49.289177,-123.116032);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord2,
      icon: 'images/sort/1.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord2);
      infoWindow.setContent("JazzFestival" + '<br>Number of people: ' + "134" + '<br>Distance: ' + "500m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='JazzFestival.html'>details</a></button> ");
      infoWindow.open(map);
    });
    markers.push(marker);

    var coord2 = new google.maps.LatLng(49.283958,-123.106306);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord2,
      icon: 'images/sort/2.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord2);
      infoWindow.setContent("VancouverAutoShow" + '<br>Number of people: ' + "122" + '<br>Distance: ' + "650m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='VancouverAutoShow.html'>details</a></button> ");
      infoWindow.open(map);
    });  
    markers.push(marker);

    var coord2 = new google.maps.LatLng(49.276020,-123.133777);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord2,
      icon: 'images/sort/4.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord2);
      infoWindow.setContent("CarAccident" + '<br>Number of people: ' + "20" + '<br>Distance: ' + "800m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='CarAccident.html'>details</a></button> ");
      infoWindow.open(map);
    }); 
    markers.push(marker);      
  },  

  findNearest: function(){
    MapsLib.setAllMap(null);

    var coord1 = new google.maps.LatLng(49.286035,-123.126975);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord1,
      //icon: 'images/sort/1.png'
	  icon: 'images/labels/MagicShow.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord1);
      infoWindow.setContent("MagicShow" + '<br>Number of people: ' + "23" + '<br>Distance: ' + "200m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='MagicShow.html'>details</a></button> ");
      infoWindow.open(map);
    });
    markers.push(marker);

    var coord2 = new google.maps.LatLng(49.283958,-123.106306);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord2,
      //icon: 'images/sort/2.png'
	  icon: 'images/labels/JazzFestival.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord2);
      infoWindow.setContent("JazzFestival" + '<br>Number of people: ' + "134" + '<br>Distance: ' + "500m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='JazzFestival.html'>details</a></button> ");
      infoWindow.open(map);
    });
    markers.push(marker);

    var coord3 = new google.maps.LatLng(49.289177,-123.116032);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord3,
      //icon: 'images/sort/3.png'
	  icon: 'images/labels/VancouverAutoShow.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord3);
      infoWindow.setContent("VancouverAutoShow" + '<br>Number of people: ' + "122" + '<br>Distance: ' + "650m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='VancouverAutoShow.html'>details</a></button> ");
      infoWindow.open(map);
    });  
    markers.push(marker);

    var coord4 = new google.maps.LatLng(49.276020,-123.133777);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord4,
      //icon: 'images/sort/4.png'
	  icon: 'images/labels/CarAccident.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord4);
      infoWindow.setContent("CarAccident" + '<br>Number of people: ' + "20" + '<br>Distance: ' + "800m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='CarAccident.html'>details</a></button> ");
      infoWindow.open(map);
    });  
    markers.push(marker);     
  },

  search: function(){
    MapsLib.setAllMap(null);

    var coord = new google.maps.LatLng(49.283958,-123.106306);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord,
      icon: 'images/blue-dot.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord);
      infoWindow.setContent("VancouverAutoShow" + '<br>Number of people: ' + "122" + '<br>Distance: ' + "650m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='VancouverAutoShow.html'>details</a></button> ");
      infoWindow.open(map);
    });  
    markers.push(marker);

    var coord2 = new google.maps.LatLng(49.276020,-123.133777);
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: coord2,
      icon: 'images/blue-dot.png'
    });
    google.maps.event.addListener(marker, 'click', function(event) {
      infoWindow.setPosition(coord2);
      infoWindow.setContent("CarAccident" + '<br>Number of people: ' + "20" + '<br>Distance: ' + "800m" 
        + '<br>' + "<button class='btn btn-default btn-xs'><a href='CarAccident.html'>details</a></button> ");
      infoWindow.open(map);
    });  
    markers.push(marker);     
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
	if (classie.has( body, 'cbp-spmenu-push-toright' ) && classie.has( menuLeft, 'cbp-spmenu-open' )) {
	  classie.toggle( showSideMenu, 'active' );
      classie.toggle( body, 'cbp-spmenu-push-toright' );
      classie.toggle( menuLeft, 'cbp-spmenu-open' );
    }
  },
  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },
  
  plotGradients: function() {
      
	gradientArray = new Array();
  
    gradientArray[0] = new google.maps.GroundOverlay(
      'images/gradients/gradient1.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.28764739221695, -123.1190136104593),
		new google.maps.LatLng(49.29048651159547, -123.1138502426526)
	  )  
	);
	
	gradientArray[1] = new google.maps.GroundOverlay(
      'images/gradients/gradient2.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.28525864062805, -123.1206572897644),
		new google.maps.LatLng(49.28744570843607, -123.1173724791986)
	  )	  
	);
	
	gradientArray[2] = new google.maps.GroundOverlay(
      'images/gradients/gradient3.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.28496964759476, -123.1277203044121),
		new google.maps.LatLng(49.28625456654555, -123.1256471037826)
	  )	  
	);
	
	gradientArray[3] = new google.maps.GroundOverlay(
      'images/gradients/gradient4.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.28184803470223, -123.1194817101374),
		new google.maps.LatLng(49.28436190252548, -123.1150192720574)
	  )  
	);
	
	gradientArray[4] = new google.maps.GroundOverlay(
      'images/gradients/gradient5.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.28167843232753, -123.131121127534),
		new google.maps.LatLng(49.28403941890748, -123.1280965087551)
	  )	  
	);
	
	gradientArray[5] = new google.maps.GroundOverlay(
      'images/gradients/gradient6.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.27541725404126, -123.1355744345223),
		new google.maps.LatLng(49.27720194507742, -123.1328201647422)
	  )	  
	);
	
	gradientArray[6] = new google.maps.GroundOverlay(
      'images/gradients/gradient7.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.27849957271322, -123.126544922702),
		new google.maps.LatLng(49.28142771090656, -123.1218526409933)
	  )	  
	);
	
	gradientArray[7] = new google.maps.GroundOverlay(
      'images/gradients/gradient8.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.2840825701532, -123.1046108428064),
		new google.maps.LatLng(49.28683758544243, -123.1006000647186)
	  )	  
	);
	
	gradientArray[8] = new google.maps.GroundOverlay(
      'images/gradients/gradient9.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.28312927075879, -123.1097415988195),
		new google.maps.LatLng(49.28473590299591, -123.1028231253418)
	  )  
	);
	
	gradientArray[9] = new google.maps.GroundOverlay(
      'images/gradients/gradient10.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.27490682747691, -123.11568461933),
		new google.maps.LatLng(49.27883029652434, -123.1096209729048)
	  )  
	);
	
    gradientArray[10] = new google.maps.GroundOverlay(
      'images/gradients/gradient11.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.2207572906352, -123.0186575848295),
		new google.maps.LatLng(49.22579178716334, -123.0108829417311)
	  )  
	);
	
    gradientArray[11] = new google.maps.GroundOverlay(
      'images/gradients/gradient12.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.23167975675577, -123.0085593262571),
		new google.maps.LatLng(49.23489878330205, -123.0026552627423)
	  )  
	);
	
	gradientArray[12] = new google.maps.GroundOverlay(
      'images/gradients/gradient13.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.22381364872149, -123.0053043964758),
		new google.maps.LatLng(49.22997559302053, -122.9946481421073)
	  )  
	);
	
	gradientArray[13] = new google.maps.GroundOverlay(
      'images/gradients/gradient14.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.2218562822333, -122.9981057652487),
		new google.maps.LatLng(49.22442058691102, -122.9935662336601)
	  )  
	);
	
	gradientArray[14] = new google.maps.GroundOverlay(
      'images/gradients/gradient15.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.22090784193556, -123.0059910527251),
		new google.maps.LatLng(49.22290018509281, -122.9970279316157)
	  )  
	);
	
    gradientArray[15] = new google.maps.GroundOverlay(
      'images/gradients/gradient16.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.18349504918952, -122.8325951427916),
		new google.maps.LatLng(49.18574227186965, -122.8267781287327)
	  )  
	);
	
	gradientArray[16] = new google.maps.GroundOverlay(
      'images/gradients/gradient17.png',
      new google.maps.LatLngBounds(
	    new google.maps.LatLng(49.17715961734528, -122.8239649472493),
		new google.maps.LatLng(49.18188680448908, -122.8199438609455)
	  )  
	);
  }
}

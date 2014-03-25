  // Get any parameter with structure <webpage>?p1=v1&p2=v2...
  GetURLParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) {
        return sParameterName[1];
      }
    }
  };
  
  // Pass in specific query and reference to dataHandler as a AsyncCallback
  getDataWithAsyncCallback = function(dataHandler, query) {
    // Builds a Fusion Tables SQL query and hands the result to dataHandler
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    var queryUrlTail = '&key='+MapsLib.googleApiKey;
    var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);
    var jqxhr = $.get(queryurl, dataHandler, "jsonp");
  };
  
  // Identifies Hashtags for hashcloud
  hashtag_regexp = /#([a-zA-Z0-9]+)/g;
  function linkHashtags(text) {
    return text.replace(
      hashtag_regexp,
      '<span class="text-primary">#$1</span>'
    );
  }; 
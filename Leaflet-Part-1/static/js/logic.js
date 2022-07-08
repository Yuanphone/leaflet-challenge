// Store our API endpoint as queryUrl.
var queryUrl =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data);
  createFeatures(data.features);
});
function getColor(depth) {
  return depth > 90 ? '#ea2c2c' :
      depth > 70 ? '#ea822c' :
          depth > 50 ? '#ee9c00' :
              depth > 30 ? '#eecc00' :
                  depth > 10 ? '#d4ee00' :
                      '#98ee00';
}

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p><b>Magnitude:</b> ${feature.properties.mag}</p>`);
  }
  function pointToLayer(feature, latlng) {
    var geojsonMarkerOptions = {
        radius: feature.properties.mag*4,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "grey",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.75
    }
    return L.circleMarker(latlng, geojsonMarkerOptions)
}
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      41.82, -115
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  // set bound
  var southwest=L.latLng(-90,-200),
      northeast=L.latLng(90,200);
  var bounds=L.latLngBounds(southwest,northeast);
  myMap.setMaxBounds(bounds);
  myMap.on('drag',function(){
      myMap.panInsideBounds(bounds,{animate:false});

  });
  var legend = L.control({ position: 'bottomright' });

      legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          depth_color = [-10, 10, 30, 50, 70, 90];
          colors=[
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            '#ee9c00',
            "#ea822c",
            "#ea2c2c"
          ];


      // loop through our depth intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depth_color.length; i++) {
          div.innerHTML +=
              '<i style="background: ' + colors[i] +'"></i> ' +
              +depth_color[i] + (depth_color[i + 1] ? '&ndash;' + depth_color[i + 1] + '<br>' : '+');
      }
      return div;
  };

  legend.addTo(myMap);

}
// example

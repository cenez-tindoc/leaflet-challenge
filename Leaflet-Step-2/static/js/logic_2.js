
  // Adding tile layer to the map
  var greymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });
  
// Creating map object
var myMap = L.map("map", {
  center: [37.45, -95.71],
  zoom: 11,
  layers: [greymap]
});

greymap.addTo(myMap);

  var tectonicplates = new L.LayerGroup();
  var earthquakes = new L.LayerGroup();
  var baseMaps = {
      GreyMap : greymap
  };

  var overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
  };

  L.control.layers(baseMaps, overlays).addTo(myMap)

  // Assemble API query URL
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  
//  GET color radius call to the query URL
d3.json(url, function(data) {
    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    }
    // set different color from magnitude
      function getColor(magnitude) {
      switch (true) {
      case magnitude > 5:
        // red
        return "#ff3633";
      case magnitude > 4:
      // red-orange
        return "#ff7733";
      case magnitude > 3:
        // orange
        return "#ffa233";
      case magnitude > 2:
        // yellow-orange
        return "#ffc733";
      case magnitude > 1:
        // yellow
        return "#ffe633";
      default:
        // green
        return "#83ff33";
      }
    }
    // set radiuss from magnitude
      function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
  
      return magnitude * 4;
    }
      // GeoJSON layer
      L.geoJson(data, {
        // Maken cricles
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
        },
        // cirecle style
        style: styleInfo,
        // popup for each marker
        onEachFeature: function(feature, layer) {
          layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
      }).addTo(earthquakes);
      earthquakes.addTo(myMap);
    
      // an object legend
      var legend = L.control({
        position: "bottomright"
      });
    
      // details for the legend
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
    
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
          "#83ff33",
          "#ffe633",
          "#ffc733",
          "#ffa233",
          "#ff7733",
          "#ff3633"
        ];
    
        // Looping through
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
      };
    
      // Finally, add legend to the map.
      legend.addTo(myMap);

      d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(data) {
        L.geoJson(data, {
            color: "red"
        }).addTo(tectonicplates);
        tectonicplates.addTo(myMap);
        });

  });

    // my color source : https://htmlcolorcodes.com/
    
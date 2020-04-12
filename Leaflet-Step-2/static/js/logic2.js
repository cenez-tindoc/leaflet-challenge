//----------------------------------------------------------------------------
// variables for API endpoints
//----------------------------------------------------------------------------
let eqURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

let flURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

//----------------------------------------------------------------------------
// Calls function to render map
//----------------------------------------------------------------------------
renderMap(eqURL, flURL);

//----------------------------------------------------------------------------
// Function to render map
//----------------------------------------------------------------------------
function renderMap(eqURL, flURL) {

  // Performs GET request for the earthquake URL
  d3.json(eqURL, function(data) {
    console.log(eqURL)
    // Stores response into eqData
    let eqData = data;
    // Performs GET request for the fault lines URL
    d3.json(flURL, function(data) {
      // Stores response into flData
      let flData = data;

      // Passes data into createFeatures function
      createFeatures(eqData, flData);
    });
  });

  // Function to create features
  function createFeatures(eqData, flData) {

    // Defines two functions that are run once for each feature in eqData
    // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
    function onEachQKLayer(feature, layer) {
      return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: 1,
        color: chooseColor(feature.properties.mag),
        fillColor: chooseColor(feature.properties.mag),
        radius:  markerSize(feature.properties.mag)
      });
    }
    function onEachEQuake(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }

    // Defines a function that is run once for each feature in flData
    // Create fault lines
    function onEachFtLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    }

    // Creates a GeoJSON layer containing the features array of the eqData object
    // Run the onEachEQuake & onEachQKLayer functions once for each element in the array
    let earthquakes = L.geoJSON(eqData, {
      onEachFeature: onEachEQuake,
      pointToLayer: onEachQKLayer
    });

    // Creates a GeoJSON layer containing the features array of the flData object
    // Run the onEachFtLine function once for each element in the array
    let faultLines = L.geoJSON(flData, {
      onEachFeature: onEachFtLine,
      style: {
        weight: 2,
        color: 'blue'
      }
    });

    // Creates a Timeline layer containing the features array of the eqData object
    // Run getInterval function to get the time interval for each earthquake (length based on magnitude)
    // Run the onEachEQuake & onEachQKLayer functions once for each element in the array
    // let timelineLayer = L.Timeline(eqData, {
    //   getInterval: function(feature) {
    //     return {
    //       start: feature.properties.time,
    //       end: feature.properties.time + feature.properties.mag * 10000000
    //     };
    //   },
    //   pointToLayer: onEachQKLayer,
    //   onEachFeature: onEachEQuake
    // });

    // Sends earthquakes, fault lines and timeline layers to the createMap function
    createMap(earthquakes, faultLines);
  }

  // Function to create map
  function createMap(earthquakes, faultLines) {
    // Define outdoors, satellite, and darkmap layers
    // Outdoors layer
    let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoiZGF2aXNjYXJkd2VsbCIsImEiOiJjamViam4yMHEwZHJ4MnJvN3kweGhkeXViIn0." +
        "A3IKm_S6COZzvBMTqLvukQ");
      // Satellite layer
    let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoiZGF2aXNjYXJkd2VsbCIsImEiOiJjamViam4yMHEwZHJ4MnJvN3kweGhkeXViIn0." +
        "A3IKm_S6COZzvBMTqLvukQ");
      // Darkmap layer
    let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoiZGF2aXNjYXJkd2VsbCIsImEiOiJjamViam4yMHEwZHJ4MnJvN3kweGhkeXViIn0." +
        "A3IKm_S6COZzvBMTqLvukQ");

    // Define a baseMaps object to hold base layers
    let baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap,
    };

    // Create overlay object to hold overlay layers
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": faultLines
    };

    // Create map, default settings: outdoors and faultLines layers display on load
    let map = L.map("map", {
      center: [37.45, -95.71],
      zoom: 11,
      layers: [outdoors, faultLines],
      scrollWheelZoom: false
    });

    // Create a layer control
    // Pass in baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: true
    }).addTo(map);

    // Adds Legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend');
      var grades = [0, 1, 2, 3, 4, 5]
      var labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };
    legend.addTo(map);

    // Adds timeline and timeline controls
  //   let timelineControl = L.TimelineSliderControl({
  //     formatOutput: function(date) {
  //       return new Date(date).toString();
  //     }
  //   });
  //   timelineControl.addTo(map);
  //   timelineControl.addTimelines(timelineLayer);
  //   timelineLayer.addTo(map);
  };
};

//----------------------------------------------------------------------------
// chooseColor function:
// Returns color for each grade parameter using ternary expressions
//----------------------------------------------------------------------------
function chooseColor(magnitude) {
  return magnitude > 5 ? "red":
    magnitude > 4 ? "orange":
      magnitude > 3 ? "gold":
        magnitude > 2 ? "yellow":
          magnitude > 1 ? "yellowgreen":
            "greenyellow"; // <= 1 default
}

//----------------------------------------------------------------------------
// Function to amplify circle size by earthquake magnitude
//----------------------------------------------------------------------------
function markerSize(magnitude) {
  return magnitude * 5
  }
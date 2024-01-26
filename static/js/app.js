const myMap = L.map('mapid').setView([54.1003503, -3.3053616], 4);
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MODE_LINE = 0;
const MODE_POLYGON = 1;

const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const polygonBtn = document.getElementById('polyBtn');
const lineBtn = document.getElementById('lineBtn');

const searchBtns = [ searchBtn, resetBtn ];
const modeBtns = [ polygonBtn, lineBtn ];

// Initialize the buttons.
searchBtns.map((b) => b.disabled = true);

// Set polygon to be the initial mode and hide mode buttons.
polygonBtn.classList.add('is-light');

let currentMarkers = [];
let currentMode = MODE_LINE;
let searchResultPolygons = [];
let currentShape = null;

polygonBtn.onclick = function () {
  // Toggle state.
  polygonBtn.classList.remove('is-light');
  lineBtn.classList.add('is-light');
  currentMode = MODE_POLYGON;
  updatePath();
};

lineBtn.onclick = function () {
  // Toggle state.
  lineBtn.classList.remove('is-light');
  polygonBtn.classList.add('is-light');
  currentMode = MODE_LINE;
  updatePath();
};

resetBtn.onclick = function () {
  if (currentShape) {
    myMap.removeLayer(currentShape);
    currentShape = null;
  }

  for (const marker of currentMarkers) {
    myMap.removeLayer(marker);
  }

  for (const polygon of searchResultPolygons) {
    myMap.removeLayer(polygon);
  }

  currentMarkers = [];
  searchResultPolygons = [];
  searchBtns.map((b) => b.disabled = true);
  currentMode = MODE_LINE;
  lineBtn.classList.remove('is-light');
  polygonBtn.classList.add('is-light');
  modeBtns.map((b) => b.classList.add('is-hidden'));

  // Hide info panel.
  document.getElementById('infoPanel').classList.add('is-hidden');
};

searchBtn.onclick = async function () {
  // No need to check if there are enough points, as the 
  // button isn't clickable until there are.
  searchBtn.classList.add('is-loading');
  
  // Remove previous results.
  for (const polygon of searchResultPolygons) {
    myMap.removeLayer(polygon);
  }

  searchResultMarkers = [];

  // Hide info panel.
  document.getElementById('infoPanel').classList.add('is-hidden');

  try {
    // Do we have a polygon or a point to search with?
    const searchRequestBody = {};

    if (currentShape) {
      searchRequestBody.shape = currentShape.toGeoJSON();
    } else {
      // Get the position of the first and only marker.
      searchRequestBody.point = { 
        lat: currentMarkers[0].getLatLng().lat, 
        lng: currentMarkers[0].getLatLng().lng
      };
    };

    // Call the search endpoint.
    const response = await fetch('/search', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchRequestBody)
    });

    const responseJSON = await response.json();
    
    responseJSON.data.map((region) => {
      // Get the GeoJSON representation for the region and make 
      // a Leaflet polygon for it, then add that to the map.
      const polygonCoords = region.boundaries.coordinates[0];
      const latLngs = [];

      for (const coords of polygonCoords) {
        const [ lng, lat ] = coords;
        latLngs.push([lat, lng]);
      }

      const regionPoly = L.polygon(latLngs, {color: 'black', weight: 1}).addTo(myMap);
      regionPoly.extraData = {
        name: region.name,
        forecast: region.forecast
      };
      regionPoly.on('mouseover', function (e) {
        this.setStyle({
          color: 'green'
        });

        document.getElementById('regionName').innerHTML = this.extraData.name;
        document.getElementById('regionData').innerHTML = `<p><b>Wind: </b>${this.extraData.forecast.wind}</p><p><b>Sea State: </b>${this.extraData.forecast.sea}</p><p><b>Weather: </b>${this.extraData.forecast.weather}</p><p><b>Visibility: </b>${this.extraData.forecast.visibility}</p>`;
      });

      regionPoly.on('mouseout', function (e) {
        this.setStyle({
          color: 'black'
        });

        document.getElementById('regionName').innerHTML = 'Details';
        document.getElementById('regionData').innerHTML = '<p>Hover over a region...</p>';
      });

      searchResultPolygons.push(regionPoly);

      if (searchResultPolygons.length > 0) {
        document.getElementById('infoPanel').classList.remove('is-hidden');
      }
    });
  } catch (e) {
    console.log(e);
  }

  searchBtn.classList.remove('is-loading');
}

function updatePath() {
  if (currentMarkers.length > 1) {
    const shapeCoords = currentMarkers.map((marker) => [ 
      marker.getLatLng().lat, 
      marker.getLatLng().lng 
    ]);

    if (currentShape) {
      myMap.removeLayer(currentShape);
    }
    
    if (currentMode === MODE_POLYGON) {
      currentShape = L.polygon(shapeCoords, {color: 'red', weight: 2, fill: true, stroke: false}).addTo(myMap);
    } else {
      currentShape = L.polyline(shapeCoords, {color: 'red', weight: 2}).addTo(myMap);
    }

    // Turn on the mode buttons.
    modeBtns.map((b) => b.classList.remove('is-hidden'));
  }

  // Can we enable search?  Yes for a single point (1 marker), 
  // yes for 3 or more points in polygon mode and 
  // yes for 2 or more points in line mode.
  // Otherwise no.
  if (currentMarkers.length == 1 || (currentMarkers.length > 2 && currentMode == MODE_POLYGON) || (currentMarkers.length > 1 && currentMode == MODE_LINE)) {
    searchBtn.disabled = false;
  } else {
    searchBtn.disabled = true;
  }
}

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
  {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(myMap);

myMap.on('click', (e) => {
  const newMarker = L.marker(e.latlng, { 
    icon: redIcon, 
    draggable: true 
  });

  newMarker.addTo(myMap);
  newMarker.on('move', () => updatePath());
  currentMarkers.push(newMarker);  
  updatePath();

  resetBtn.disabled = false;
});

const myMap = L.map('mapid').setView([54.1003503, -3.3053616], 4);
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');

const allBtns = [ searchBtn, resetBtn ];

// Initialize the buttons.
allBtns.map((b) => b.disabled = true);

let currentMarkers = [];
let searchResultPolygons = [];
let currentPolygon = null;

resetBtn.onclick = function () {
  if (currentPolygon) {
    myMap.removeLayer(currentPolygon);
    currentPolygon = null;
  }

  for (const marker of currentMarkers) {
    myMap.removeLayer(marker);
  }

  for (const polygon of searchResultPolygons) {
    myMap.removeLayer(polygon);
  }

  currentMarkers = [];
  searchResultPolygons = [];
  allBtns.map((b) => b.disabled = true);

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

    if (currentPolygon) {
      searchRequestBody.polygon = currentPolygon.toGeoJSON();
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

function updatePolygon() {
  if (currentMarkers.length > 2) {
    const polyCoords = currentMarkers.map((marker) => [ 
      marker.getLatLng().lat, 
      marker.getLatLng().lng 
    ]);

    if (currentPolygon) {
      myMap.removeLayer(currentPolygon);
    }
    
    currentPolygon = L.polygon(polyCoords, {color: 'red', weight: 2, fill: true, stroke: false}).addTo(myMap);
  }

  if (currentMarkers.length === 1 || currentMarkers.length > 2) {
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
  newMarker.on('move', () => updatePolygon());
  currentMarkers.push(newMarker);  
  updatePolygon();

  resetBtn.disabled = false;
});
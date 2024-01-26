mapboxgl.accessToken = 'pk.eyJ1IjoidmFsbGVudGVtYXJ0aW4iLCJhIjoiY2xuYmlmMTZtMDZwYTJtbnpoaWk3bGlodyJ9.QCHl60dk3a2aypwVWh6RUA';
var map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [125.646108, 7.135650], // starting position
    zoom: 14 // starting zoom
});

map.on('load', () => {
    // Add a data source containing GeoJSON data.
    map.addSource('maine', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                // These coordinates outline Maine.
                'coordinates': [
                    [
                        [125.646108, 7.135650],
                        [125.646313, 7.135507],
                        [125.648396, 7.136630],
                        [125.649998, 7.133296],
                        [125.648457, 7.132101],
                        [125.647096, 7.133535],
                        [125.646348, 7.133771],
                        [125.645245, 7.134893],
                        [125.646108, 7.135650]
                    ]
                ]
            }
        }
    });

    // Add a new layer to visualize the polygon.
    map.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': 'maine', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
        }
    });
    // Add a black outline around the polygon.
    map.addLayer({
        'id': 'outline',
        'type': 'line',
        'source': 'maine',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 3
        }
    });

    map.addSource('QUIBS', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                // These coordinates outline QUIBS.
                'coordinates': [
                    [
                        [125.646108, 7.135650],
                        [125.646313, 7.135507],
                        [125.648396, 7.136630],
                        [125.649998, 7.133296],
                        [125.646108, 7.135650]
                    ]
                ]
            }
        }
    });

    // Add a new layer to visualize the polygon.
    map.addLayer({
        'id': 'QUIBS',
        'type': 'fill',
        'source': 'QUIBS', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#ffffff', // blue color fill
            'fill-opacity': 0.5
        }
    });
    // Add a black outline around the polygon.
    map.addLayer({
        'id': 'QUIBSoutline',
        'type': 'line',
        'source': 'QUIBS',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 3
        }
    });

    map.addSource('LFC', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                // These coordinates outline LFC.
                'coordinates': [
                    [
                        [125.649604, 7.109236],
                        [125.650369, 7.108841],
                        [125.650023, 7.108256],
                        [125.649131, 7.108759],
                        [125.649604, 7.109236]
                    ]
                ]
            }
        }
    });

    // Add a new layer to visualize the polygon.
    map.addLayer({
        'id': 'LFC',
        'type': 'fill',
        'source': 'LFC', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
        }
    });
    // Add a black outline around the polygon.
    map.addLayer({
        'id': 'LFCoutline',
        'type': 'line',
        'source': 'LFC',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 3
        }
    });
});
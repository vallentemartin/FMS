
var test1 = [];
var obj = {};
var longlat = [];
var jsondata = [];

mapboxgl.accessToken = 'pk.eyJ1IjoiamJ1cnFzIiwiYSI6ImNsbmNnN3psdzBqeGUyeG9hNzhjam5reGcifQ.fyErGg472qiTnQXjYGA3ag';
var map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    // style: 'mapbox://styles/mapbox/light-v11',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [125.647859, 7.134382], // starting position
    zoom: 12 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);

map.on('style.load', () => {
    $('input[name="polygon"]').click(function () {
        var checked = $(this).is(':checked');
        var radvalue = $('input:radio[name=polygon]:checked').val();
        if (radvalue == 1) {
            alert("checked");

            if (jsondata.length === 0) {
                getTitlePolygon();
            }
            else {
                removeSources();
                getTitlePolygon();
            }
        } else if (radvalue == 2) {
            alert("check 2");
            console.log(jsondata.length === 0);
            if (jsondata.length === 0) {
                alert('getpolygon');
                contractPolygon();
            }
            else {


                removeSources();
                alert("remove then init");
                console.log(jsondata);
                contractPolygon();
            }

        }
        else {
            alert("check 3");
            removeSources();
        }
    });
});


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function removeSources() {
    for (let i = 0; i < jsondata.length; i++) {
        const element = jsondata[i];
        map.removeLayer(element.data.id + 'hover_fill');
        map.removeLayer(element.data.id + 'outline');
        map.removeSource(element.data.id + 'sourceid');
    }
    jsondata.length = 0;
}

// $("#ldms").click(function () {
//     var checked = $(this).is(':checked');
//     if (checked) {
//         alert("checked");

//     } else {
//         // alert("unchecked");
//         // mapInit();
//     }
// });

function getTitlePolygon() {

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getTitlePolygon',
        type: "post",
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log(data);
            var counter = 1;
            for (var i = 0; i < data.length; i++) {
                console.log(data[i].polygon);
                if (data[i].polygon != null) {
                    console.log(data[i].polygon.split("|"));
                    items = data[i].polygon.split('|');
                    console.log(data[i].City);
                    //  test = items.split(',');
                    latlng = [];
                    for (var j = 0; j < items.length; j++) {
                        coordinate = items[j];
                        var coord = coordinate.split(',');
                        var coords = [];
                        for (let k = 0; k < coord.length; k++) {
                            const parsecoords = parseFloat(coord[k]);
                            coords.push(parsecoords);
                        }
                        latlng.push(coords);
                    }
                    var json = {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [
                                    latlng
                                ]
                            },
                            'id': counter++,
                            'code': data[i].LandownerTitleCode,
                            'properties': {
                                'description': "<h5><strong>Title Information</strong></h5>" + "<strong>Fullname</strong>:" + data[i].fullname + "<br>" + "<strong>LandownerTitleCode</strong>:" + data[i].LandownerTitleCode + "<br>" + "<strong>LandTitleNo</strong>:" + data[i].LandTitleNo + "<br>" + "<strong>Barangay</strong>:" + data[i].Barangay + "</br>" + "<strong>City</strong>:" + data[i].City + "<br>" + "<strong>Province</strong>:" + data[i].Province + "<br>"
                            }
                        }
                    }
                    jsondata.push(json);
                }


            }

            displayPolygon();


        },
        error: function (x) {
            alert('message');
            console.log(x);
        }
    });
}

function displayPolygon() {
    console.log(jsondata);
    var hoveredPolygonId = null;
    var sourceId = null;
    // map.on('load', () => {
    // Add a data source containing GeoJSON data.
    for (let i = 0; i < jsondata.length; i++) {
        const element = jsondata[i];
        map.addSource(element.data.id + 'sourceid', jsondata[i]);
        //Add a black outline around the polygon.
        map.addLayer({
            'id': element.data.id + 'outline',
            'type': 'line',
            'source': element.data.id + 'sourceid',
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': 3
            }
        });
        map.addLayer({
            'id': element.data.id + 'hover_fill',
            'type': 'fill',
            'source': element.data.id + 'sourceid',
            'layout': {},
            'paint': {
                'fill-color': getRandomColor(),
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]
            }
        });
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        });
        map.on('mousemove', element.data.id + 'hover_fill', (e) => {
            map.getCanvas().style.cursor = 'Pointer';
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
            popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
            if (e.features.length > 0) {
                if (hoveredPolygonId !== null) {
                    map.setFeatureState({
                        source: sourceId,
                        id: hoveredPolygonId

                    }, {
                        hover: false
                    });
                }
                hoveredPolygonId = e.features[0].id;
                sourceId = e.features[0].source;
                map.setFeatureState({
                    source: sourceId,
                    id: hoveredPolygonId
                }, {
                    hover: true
                });
            }
        });
        map.on('mouseleave', element.data.id + 'hover_fill', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
            if (hoveredPolygonId !== null) {
                map.setFeatureState({
                    source: sourceId,
                    id: hoveredPolygonId
                }, {
                    hover: false
                });
            }
            hoveredPolygonId = null;

        });
        map.on('click', element.data.id + 'hover_fill', () => {
            // alert(element.data.id);
            var code = element.data.code;
            var dataSource = 'ContractInfo';
            var dataSourceIdCol = 'LandownerTitleCode';
            showModal();
            ModalSize('xl');
            var title = 'Land Information ';
            // // var body = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Landowner Information </button >' +
            // //     '<button type = "button" class="btn btn-default" data-dismiss="modal" > Titles </button >' +
            // //     '<button type = "button" class="btn btn-default" data-dismiss="modal" > Contracts </button >';
            var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
            // $('.modal-title').html(title);
            // $('.modal-body').html(body);
            // $('.modal-footer').html(footer);
            var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
            // $('.modal-title').html(title);
            // $('.modal-footer').html(footer);
            $.ajax({
                url: '/Pages/Maps/mapinfo',
                type: 'post',
                dataType: 'html',
                success: function (htmlreturn) {
                    $('.modal-body').html(htmlreturn);
                    getDetail(dataSource, dataSourceIdCol, code);
                },
                error: function () {
                    toastr.error('Error on fetching modal view!');
                }
            })
            //getPolygonDetail(code);



        });

    }
    // });

}
function getDetail(dataSource, filter, code) {
    startLoading();

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: dataSource,
            filter: filter,
            selectedID: code,
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var fields = $('.triggerdetail');
            var fieldID = [];
            for (var x in fields) {
                if (fields[x].className != undefined) {
                    var y = fields[x].className.split(' ');
                    fieldID.push(y[0]);
                }
            }
            for (var j in fieldID) {
                console.log($('.' + fieldID[j] + '.triggerdetail')[0].tagName == 'SELECT');
                if ($('.' + fieldID[j] + '.triggerdetail')[0].tagName == 'SELECT') {
                    var tagClasses = $('.' + fieldID[j] + '.triggerdetail')[0].className.split(' ');
                    var optSource = tagClasses[2];
                    var optFilter = optSource + 'Code';
                    var name = tagClasses[1];
                } else {
                    $('.' + fieldID[j]).html(data[fieldID[j]]);

                }
            }
            stopLoading();
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}
function getPolygonDetail(code) {
    console.log(code);
    var fieldID = [];
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getPolygonDetail',
        type: "post",
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp,
            LandownerTitleCode: code
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log(fieldID);
            for (var j in fieldID) {

                if ($('.' + fieldID[j] + '.triggerdetail')[0].tagName == 'SELECT') {
                    var tagClasses = $('.' + fieldID[j] + '.triggerdetail')[0].className.split(' ');
                    var optSource = tagClasses[2];
                    var optFilter = optSource + 'Code';
                    var name = tagClasses[1];

                } else {
                    $('.' + fieldID[j]).val(data[fieldID[j]]);
                }
            }
        },
        error: function (x) {
            alert('message');
            console.log(x);
        }
    });
}

function contractPolygon() {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getContractPolygon',
        type: "post",
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            const colorMap = {};
            const colors = [];
            var counter = 1;
            for (var i = 0; i < data.length; i++) {

                items = data[i].polygon.split('|');
                //  test = items.split(',');
                const value = data[i].LandownerContractCode;
                if (!(value in colorMap)) {
                    // Generate a random color for new values
                    const color = getRandomColor(); // Random hex color
                    colorMap[value] = color;
                }
                colors.push(colorMap[value]);

                // console.log('color', getRandomColor());
                latlng = [];
                for (var j = 0; j < items.length; j++) {
                    coordinate = items[j];
                    var coord = coordinate.split(',');
                    var coords = [];
                    for (let k = 0; k < coord.length; k++) {
                        const parsecoords = parseFloat(coord[k]);
                        coords.push(parsecoords);
                    }
                    latlng.push(coords);
                }

                var json = {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                latlng
                            ]
                        },
                        'color': colorMap[value],
                        'id': counter++,
                        'code': data[i].LandownerTitleCode,
                        'properties': {
                            'description': "<h5><strong>Title Information</strong></h5>" + "<strong>Fullname</strong>:" + data[i].fullname + "<br>" + "<strong>LandownerTitleCode</strong>:" + data[i].LandownerTitleCode + "<br>" + "<strong>LandTitleNo</strong>:" + data[i].LandTitleNo + "<br>" + "<strong>Barangay</strong>:" + data[i].Barangay + "</br>" + "<strong>City</strong>:" + data[i].City + "<br>" + "<strong>Province</strong>:" + data[i].Province + "<br>"
                        }
                    }
                }
                jsondata.push(json);
                console.log(jsondata);
            }
            displayContractPolygon();
        },
        error: function (x) {
            alert('error');
            console.log(x);
        }
    });
}

function displayContractPolygon() {
    var hoveredPolygonId = null;
    var sourceId = null;
    // map.on('load', () => {
    // Add a data source containing GeoJSON data.
    for (let i = 0; i < jsondata.length; i++) {
        const element = jsondata[i];
        console.log(element);
        map.addSource(element.data.id + 'sourceid', jsondata[i]);
        //Add a black outline around the polygon.
        map.addLayer({
            'id': element.data.id + 'outline',
            'type': 'line',
            'source': element.data.id + 'sourceid',
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': 3
            }
        });
        map.addLayer({
            'id': element.data.id + 'hover_fill',
            'type': 'fill',
            'source': element.data.id + 'sourceid',
            'layout': {},
            'paint': {
                'fill-color': element.data.color,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]

            }
        });


        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        });
        map.on('mousemove', element.data.id + 'hover_fill', (e) => {
            map.getCanvas().style.cursor = 'Pointer';
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
            popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
            if (e.features.length > 0) {
                if (hoveredPolygonId !== null) {
                    map.setFeatureState({
                        source: sourceId,
                        id: hoveredPolygonId

                    }, {
                        hover: false
                    });
                }
                hoveredPolygonId = e.features[0].id;
                sourceId = e.features[0].source;
                map.setFeatureState({
                    source: sourceId,
                    id: hoveredPolygonId
                }, {
                    hover: true
                });
            }
        });
        map.on('mouseleave', element.data.id + 'hover_fill', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
            if (hoveredPolygonId !== null) {
                map.setFeatureState({
                    source: sourceId,
                    id: hoveredPolygonId
                }, {
                    hover: false
                });
            }
            hoveredPolygonId = null;

        });

        map.on('click', element.data.id + 'hover_fill', () => {
            // alert(element.data.id);
            var code = element.data.code;
            var dataSource = 'ContractInfo';
            var dataSourceIdCol = 'LandownerTitleCode';
            showModal();
            ModalSize('xl');
            var title = 'Land Information ';
            // // var body = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Landowner Information </button >' +
            // //     '<button type = "button" class="btn btn-default" data-dismiss="modal" > Titles </button >' +
            // //     '<button type = "button" class="btn btn-default" data-dismiss="modal" > Contracts </button >';
            var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
            // $('.modal-title').html(title);
            // $('.modal-body').html(body);
            // $('.modal-footer').html(footer);
            var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
            // $('.modal-title').html(title);
            // $('.modal-footer').html(footer);
            $.ajax({
                url: '/Pages/Maps/mapinfo',
                type: 'post',
                dataType: 'html',
                success: function (htmlreturn) {
                    $('.modal-body').html(htmlreturn);
                    getDetail(dataSource, dataSourceIdCol, code);
                },
                error: function () {
                    toastr.error('Error on fetching modal view!');
                }
            })
            //getPolygonDetail(code);



        });




    }
}















// mapInit();
// $("#ldms").click(function () {
//     var checked = $(this).is(':checked');
//     if (checked) {
//         // alert("checked");
//         getPolygon();
//     } else {
//         // alert("unchecked");
//         mapInit();
//     }
// });


// function mapInit() {
//     mapboxgl.accessToken = 'pk.eyJ1IjoiamJ1cnFzIiwiYSI6ImNsbmNnN3psdzBqeGUyeG9hNzhjam5reGcifQ.fyErGg472qiTnQXjYGA3ag';
//     var map = new mapboxgl.Map({
//         container: 'map', // container ID
//         // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//         style: 'mapbox://styles/mapbox/light-v11',
//         center: [125.647859, 7.134382], // starting position
//         zoom: 12 // starting zoom
//     });

//     map.addControl(new mapboxgl.NavigationControl());
//     map.addControl(
//         new mapboxgl.GeolocateControl({
//             positionOptions: {
//                 enableHighAccuracy: true
//             },
//             trackUserLocation: true
//         })
//     );
// }

// function getPolygonDetail(code) {
//     console.log(code);
//     $.ajax({
//         url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getPolygonDetail',
//         type: "post",
//         dataType: 'json',
//         data: JSON.stringify({
//             username: $("#username").val(),
//             token: $("#token").val(),
//             sysapp: sysapp,
//             LandTitleCode: code
//         }),
//         contentType: "application/json; charset=utf-8",
//         success: function (data) {
//             console.log(data);
//         },
//         error: function (x) {
//             alert('message');
//             console.log(x);
//         }
//     });
// }
// function getRandomColor() {
//     var letters = '0123456789ABCDEF';
//     var color = '#';
//     for (var i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }
// var test = {};
// var test1 = [];
// var obj = {};
// var longlat = [];
// var jsondata = [];

// function getPolygon() {
//     var index = [];
//     var count = [];
//     var hoveredPolygonId = null;
//     var sourceId = null;
//     $.ajax({
//         url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getBlocks',
//         type: "post",
//         dataType: 'json',
//         data: JSON.stringify({
//             username: $("#username").val(),
//             token: $("#token").val(),
//             sysapp: sysapp
//         }),
//         contentType: "application/json; charset=utf-8",
//         success: function (data) {
//             var counter = 1;
//             for (var i = 0; i < data.length; i++) {
//                 items = data[i].polygon.split('|');
//                 //  test = items.split(',');
//                 dex = [];
//                 for (var j = 0; j < items.length; j++) {
//                     coordinate = items[j];
//                     var coord = coordinate.split(',');
//                     var coords = [];
//                     for (let k = 0; k < coord.length; k++) {
//                         const parsecoords = parseFloat(coord[k]);
//                         coords.push(parsecoords);
//                     }
//                     dex.push(coords);
//                 }
//                 var json = {
//                     'type': 'geojson',
//                     'data': {
//                         'type': 'Feature',
//                         'geometry': {
//                             'type': 'Polygon',
//                             'coordinates': [
//                                 dex
//                             ]
//                         },
//                         'id': counter++,
//                         'code': data[i].LandTitleCode,
//                         'properties': {
//                             'description': "<strong>LandTitleCode</strong>:" + data[i].LandTitleCode + "<br>" + data[i].LandTitleNo + "<br>" + data[i].City + "<br>" + data[i].Province + "<br>" + data[i].Barangay + "</br>"
//                         }
//                     }
//                 }
//                 jsondata.push(json);

//             }
//             maps(jsondata);

//         },
//         error: function (x) {
//             alert('message');
//             console.log(x);
//         }
//     });
// }
// function maps(jsondata) {
//     mapboxgl.accessToken = 'pk.eyJ1IjoiamJ1cnFzIiwiYSI6ImNsbmNnN3psdzBqeGUyeG9hNzhjam5reGcifQ.fyErGg472qiTnQXjYGA3ag';
//     var map = new mapboxgl.Map({
//         container: 'map', // container ID
//         // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//         style: 'mapbox://styles/mapbox/light-v11',
//         center: [125.647859, 7.134382], // starting position
//         zoom: 12 // starting zoom
//     });


//     map.addControl(new mapboxgl.NavigationControl());
//     map.addControl(
//         new mapboxgl.GeolocateControl({
//             positionOptions: {
//                 enableHighAccuracy: true
//             },
//             trackUserLocation: true
//         })
//     );
//     var hoveredPolygonId = null;
//     var sourceId = null;
//     map.on('load', () => {
//         // Add a data source containing GeoJSON data.
//         var centeer = [];
//         for (let i = 0; i < jsondata.length; i++) {
//             const element = jsondata[i];

//             // console.log(element.data.properties.description);
//             // var center = turf.centroid(element.data.geometry);
//             // console.log(center.geometry.coordinates);
//             // const popup1 = new mapboxgl.Popup({ offset: 25 }).setText(element.data.properties.description);
//             // // create DOM element for the marker
//             // const el = document.createElement('div');
//             // el.id = 'marker';
//             // new mapboxgl.Marker({ color: 'black' })
//             //     .setLngLat(center.geometry.coordinates)
//             //     .setPopup(popup1) // sets a popup on this marker
//             //     .addTo(map)

//             map.addSource(element.data.id + 'sourceid', jsondata[i]);
//             //Add a black outline around the polygon.
//             map.addLayer({
//                 'id': element.data.id + 'outline',
//                 'type': 'line',
//                 'source': element.data.id + 'sourceid',
//                 'layout': {},
//                 'paint': {
//                     'line-color': '#000',
//                     'line-width': 3
//                 }
//             });
//             map.addLayer({
//                 'id': element.data.id + 'hover_fill',
//                 'type': 'fill',
//                 'source': element.data.id + 'sourceid',
//                 'layout': {},
//                 'paint': {
//                     'fill-color': getRandomColor(),
//                     'fill-opacity': [
//                         'case',
//                         ['boolean', ['feature-state', 'hover'], false],
//                         1,
//                         0.5
//                     ]
//                 }
//             });
//             var popup = new mapboxgl.Popup({
//                 closeButton: false,
//                 closeOnClick: false
//             });
//             map.on('mousemove', element.data.id + 'hover_fill', (e) => {
//                 map.getCanvas().style.cursor = 'Pointer';
//                 var coordinates = e.features[0].geometry.coordinates.slice();
//                 var description = e.features[0].properties.description;
//                 popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
//                 if (e.features.length > 0) {
//                     if (hoveredPolygonId !== null) {
//                         map.setFeatureState({
//                             source: sourceId,
//                             id: hoveredPolygonId

//                         }, {
//                             hover: false
//                         });
//                     }
//                     hoveredPolygonId = e.features[0].id;
//                     sourceId = e.features[0].source;
//                     map.setFeatureState({
//                         source: sourceId,
//                         id: hoveredPolygonId
//                     }, {
//                         hover: true
//                     });
//                 }
//             });
//             map.on('mouseleave', element.data.id + 'hover_fill', () => {
//                 map.getCanvas().style.cursor = '';
//                 popup.remove();
//                 if (hoveredPolygonId !== null) {
//                     map.setFeatureState({
//                         source: sourceId,
//                         id: hoveredPolygonId
//                     }, {
//                         hover: false
//                     });
//                 }
//                 hoveredPolygonId = null;

//             });
//             map.on('click', element.data.id + 'hover_fill', () => {
//                 // alert(element.data.id);
//                 var code = element.data.code;
//                 showModal();
//                 ModalSize('xl');
//                 var title = 'Polygon Details ';
//                 var body = '<h1>SAMPLE DETAILS</h1>';
//                 var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
//                 $('.modal-title').html(title);
//                 $('.modal-body').html(body);
//                 $('.modal-footer').html(footer);
//                 getPolygonDetail(code);

//             });

//         }
//     });

// }

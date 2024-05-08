$('.HTML_container').ready(function () {
    initDataTables('LandownerTitle');
    getSysAllData('LandownerTitle');
})
function getPolygon(dataSource, filter) {
    var data = $('.polygon').val();
    var fields = $('.triggerdetail');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: dataSource,
            filter: filter,
            selectedID: $('.selectedid').data('id'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            for (var j in fieldID) {
                if ($('.' + fieldID[j] + '.triggerdetail')[0].tagName == 'SELECT') {
                    var tagClasses = $('.' + fieldID[j] + '.triggerdetail')[0].className.split(' ');
                    var optSource = tagClasses[2];
                    var optFilter = optSource + 'Code';
                    var name = tagClasses[1];
                    getOptDataForUpdate(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
                } else {
                    $('.' + fieldID[j]).val(data[fieldID[j]]);
                }
            }
            if (Permission.includes(dataSource + "_update") || excempted.includes($("#username").val())) {
                if ($('.status').data('status') == 0) {
                    $('.triggerdetail').prop('disabled', 'true');
                }
            } else {
                $('.triggerdetail').prop('disabled', 'true');
            }
            stopLoading();
            console.log(data.polygon);
            if (data.polygon == null || data.polygon == '') {
                var json = null;
                maps(json);
            }
            else {
                var counter = 1;
                items = data.polygon.split('|');
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
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [

                                latlng

                            ]
                        }
                    }]
                };
                maps(json);
            }
        }, error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })


}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function maps(json) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamJ1cnFzIiwiYSI6ImNsbmNnN3psdzBqeGUyeG9hNzhjam5reGcifQ.fyErGg472qiTnQXjYGA3ag';

    if (json != null) {
        var zoomcoord = '';
        zoomcoord = json.features[0].geometry.coordinates[0][0];
    }
    else {
        zoomcoord = [125.647859, 7.134382];
    }
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        //style: 'mapbox://styles/mapbox/light-v11',
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: zoomcoord,
        // [125.647859, 7.134382], // starting position
        zoom: 13 // starting zoom
    });
    var hoveredPolygonId = null;
    var sourceId = null;
    var draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        }
    });
    var polygondraw = e => {
        var geodata = [];
        console.log(e.features[0]);
        for (let i = 0; i < e.features[0].geometry.coordinates[0].length; i++) {
            const element = e.features[0].geometry.coordinates[0][i];
            var items = element.join(',');
            geodata.push(items);
        }
        var geoloc = geodata.join('|');
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'common/updateSysData',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({
                username: $("#username").val(),
                token: $("#token").val(),
                dataSource: dataSource,
                filter: dataSourceIdCol,
                selectedid: $('.selectedid').data('id'),
                syscol: 'polygon',
                syscolval: geoloc,
                sysapp: sysapp,
            }),
            contentType: "application/json; charset=utf-8",
            success: function () {
                getSysAllData(dataSource);
            },
            error: function () {
                toastr.error('Error on Updating!');
            }
        })
    }

    if (json != null) {
        map.addControl(draw);
        map.on('draw.create', polygondraw);
        map.on('draw.delete', e => { });
        map.on('draw.update', polygondraw);
        draw.add(json);
    }
    else {

        map.addControl(draw);
        map.on('draw.create', polygondraw);
        map.on('draw.delete', e => { });
        map.on('draw.update', polygondraw);

    }
    map.on('load', () => {
        map.resize();
    });
}

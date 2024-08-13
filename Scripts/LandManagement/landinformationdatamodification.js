$('.HTML_container').ready(function () {
    initDataLandInformation('LandInformation_Float');
    getSysAllLandInformation('LandInformation_Float');
})
//START: DATA TABLE
/**
 * Description: This function initialize the data table set by ID.
 * 
 * @param {*} Data 
 */
function initDataLandInformation(Data) {
    $('#tbl_' + Data).DataTable({
        language: {
            sSearch: "",
            searchPlaceholder: "Search records"
        },
        paging: true,
        lengthChange: false,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        responsive: true,
        order: [[1, 'desc']],
        lengthMenu: [
            [10, 25, 50, 100],
            ['10 rows', '25 rows', '50 rows', '100 rows']
        ],
        buttons: [
            "pageLength",
            "colvis",
            {
                extend: 'excelHtml5',
                title: Data + 'Export'
            }
        ]
    }).buttons().container().appendTo('#tbl_' + Data + '_wrapper .col-md-6:eq(0)');
    $('#tbl_' + Data + '_paginate').css('font-size', 'smaller').css('float', 'right');
    $('#tbl_' + Data + '_filter').css('float', 'right');
    if (Data != 'SysUsers' && Data != 'Period' && Data != 'Calendar') {
        // var htmlFilter = ' <datatablefilterbox><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
        //     'checked ' +
        //     'data-bootstrap-switch ' +
        //     'data-off-color="danger" ' +
        //     'data-on-color="success" ' +
        //     'data-on-text="Enabled" ' +
        //     'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllLandownerData(\'' + Data + '\')" title="Reload Table"><i class="fas fa-redo-alt"></i> Reload</button>';
        // $('#tbl_' + Data + '_filter').prepend(htmlFilter);
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
}
/**
 * Description: This function fetch the data of the specific table
 * 
 * @param {*} sourceLandInformation 
 */
function getSysAllLandInformation(sourceLandInformation) {
    showdatatablesLoader(sourceLandInformation);
    var headcol = $('#tbl_' + sourceLandInformation + ' thead tr th');
    var colid = [];
    for (var x in headcol) {
        if (headcol[x].className != undefined) {
            var y = headcol[x].className.split(' ');
            colid.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getFloatLandInfoDataByStatus',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandInformation,
            isactive: $('.statusFilter').is(':checked'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('landowner data', data);
            var datarow = [];
            $('#tbl_' + sourceLandInformation).DataTable().clear().draw();
            for (var i in data) {
                console.log('data table LO', data[i].LandownerCode);
                var dataarr = [];
                for (var j in colid) {
                    if (colid[j] == 'id') {
                        if (data[i].floatStatus == 1) {
                            dataarr.push('<div style="text-align:center">' +
                                '<button type="button" onclick="viewLandInfomodal(\'' + sourceLandInformation + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button>' +
                                '<button type="button" onclick="updateLandInfomodal(\'' + sourceLandInformation + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].floatStatus + '\')" class="btn btn-outline-info btn-xs" style="width: 80px; margin-left: 10px; margin-right: 10px;">Update</button>' +
                                '</div>');
                        } else {
                            dataarr.push('<div style="text-align:center"><button type="button" onclick="viewLandInfomodal(\'' + sourceLandInformation + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button></div>');
                        }
                        // dataarr.push('<div style="text-align:center"><button type="button" onclick="updateLandownerData(\'' + sourceLandInformation + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
                    } else if (colid[j] == 'floatStatus') {
                        switch (data[i].floatStatus) {
                            case 0:
                                dataarr.push('<div style="text-align:center;color:#155724"><b>For Approval</b></div>');
                                break;
                            case 1:
                                dataarr.push('<div style="text-align:center;color:#a68d00"><b>Returned</b></div>');
                                break;
                            case 2:
                                dataarr.push('<div style="text-align:center;color:#007bff"><b>Approved</b></div>');
                                break
                            case 3:
                                dataarr.push('<div style="text-align:center;color:#8b0000"><b>Disapproved</b></div>');
                                break
                            default:
                                dataarr.push('<div style="text-align:center;color:#A5C18A"><b>Error Status</b></div>');
                                break;
                        }
                    } else if (colid[j] == 'geoLocation') {
                        dataarr.push('<div style="text-align:center"><button class="btn btn-success-sm" onclick="showiFrame(\'' + data[i][colid[j]] + '\')">' + data[i][colid[j]] + '</a></div>');
                    } else {
                        dataarr.push('<div style="text-align:center">' + data[i][colid[j]] + '</div>');
                    }
                }
                datarow.push(dataarr);
            }
            $('#tbl_' + sourceLandInformation).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceLandInformation);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceLandInformation);
        }
    })
}
//START: LAND INFORMATION FLOAT VIEW MODAL
function viewLandInfomodal(data, id, name) {
    console.log('modal LI data', data);
    console.log('modal LI id', id);
    console.log('modal LI name', name);
    showModal();
    ModalSize('xl');
    var title = 'View Land Information (<b class="selectedid" data-id="' + id + '">' + name + '</b>) ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    title += '<b></b>';
    if (Permission.includes(data + "_view") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' -<b style="color:#C73644"> Read-Only</b>');
    }
    $.ajax({
        url: $('#tbl_' + data).data('viewpage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//END: LAND INFORMATION FLOAT VIEW MODAL
//START: LAND INFORMATION FLOAT VIEW REMARKS
function getLandInformationRemarks(LandInformationCode) {
    console.log('LandInformationCode', LandInformationCode);
    var inputDataCollection = {
        LandInformationCode: LandInformationCode,
        username: $("#username").val(),
        token: $("#token").val(),
        dataSource: sourceLandInformation,
        filter: dataSourceIdCol,
        FloatID: $('.selectedid').data('id'),
        sysapp,
    };
    console.log('test', inputDataCollection);
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLandInformationRemarks',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(inputDataCollection),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('land information remarks1', data);
            for (var i in data) {
                console.log('remarks', data[i].remarks);
                if (data[i].remarks == '') {
                    // var createdon = data[i].createdon + ' - '
                    // var remarks = data[i].remarks + '\n'
                } else {
                    var createdon = data[i].createdon + ' - '
                    var remarks = data[i].remarks + '\n'
                    $('.historyremarks').append('<li><b>' + createdon + '</b>' + remarks + '</li>');
                }
            }
        },
        error: function () {
            toastr.error('Error on Updating!');
        }
    })
}
//END: LAND INFORMATION FLOAT VIEW REMARKS
//START: LAND FLOAT UPDATE
//UPDATE MODAL
/**
 * Description: To update data of the specific table.
 * 
 * @param {*} data 
 * @param {*} id 
 * @param {*} name 
 * @param {*} status 
 */
function updateLandInfomodal(data, id, name, status) {
    console.log('update modal float status', status);
    showModal();
    ModalSize('xl');
    var title = 'Update Land Information <b class="selectedid" data-id="' + id + '">' + name + '</b> ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    title += '<b></b>';
    if (Permission.includes(data + "_update") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' <em>(Read Only)</em>');
    }
    $.ajax({
        url: $('#tbl_' + data).data('editpage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//DATA CRUD start
function getSysLandInfoFloatingData(sourceLandInformation, filter) {

    startLoading();
    var fields = $('.triggerlandinformation');
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
            dataSource: sourceLandInformation,
            filter: filter,
            selectedID: $('.selectedid').data('id'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('land information update', data);

            // if ( data.WithCoOwner == false) {
            //     $('.hideCoOwner').hide();
            // } else {
            //     $('.hideCoOwner').show();
            // }

            // if ( data.DocumentTypeCode != 4 ) {
            //     $('#hideRemarks').hide();
            // } else {
            //     $('#hideRemarks').show();
            // }

            for (var j in fieldID) {
                if ($('.' + fieldID[j] + '.triggerlandinformation')[0].tagName == 'SELECT') {
                    var tagClasses = $('.' + fieldID[j] + '.triggerlandinformation')[0].className.split(' ');
                    var optSource = tagClasses[2];
                    var optFilter = optSource + 'Code';
                    var name = tagClasses[1];
                    getOptDataForLandInformationUpdate(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
                } else {
                    $('.' + fieldID[j]).val(data[fieldID[j]]);
                }
            }
            if (Permission.includes(sourceLandInformation + "_update") || excempted.includes($("#username").val())) {
                if ($('.status').data('status') == 0) {
                    $('.triggerlandinformation').prop('disabled', 'true');
                }
            } else {
                $('.triggerlandinformation').prop('disabled', 'true');
            }

            //START: PARAMETER: PROVINCECODE TO FETCH CITY
            var provinceCode = data.provinceCode;
            $('#citySelect').append('<option value="-">loading...</option>');
            var CITYHTML = '<option value="' + data.cityCode + '" selected disabled>' + data.cityName + '</option>';
            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'common/getCityByProvince',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    data: data,
                    ProvinceCode: provinceCode,
                    username: $("#username").val(),
                    token: $("#token").val(),
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.length !== 0) {
                        for (var i in data) {
                            CITYHTML += '<option value="' + data[i].cityCode + '">' + data[i].cityName + '</option>';
                        }
                        $('#citySelect').html(CITYHTML);
                    }
                }
            })
            //END: PARAMETER: PROVINCECODE TO FETCH CITY

            //START: PARAMETER: CITYICODE TO FETCH BARANGAY
            var cityCode = data.cityCode;
            $('#barangaySelect').append('<option value="-">loading...</option>');
            var BRGYHTML = '<option value="' + data.barangayCode + '" selected disabled>' + data.barangayName + '</option>';
            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'common/getBarangayByCity',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    CityCode: cityCode,
                    username: $("#username").val(),
                    token: $("#token").val(),
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.length !== 0) {
                        for (var i in data) {
                            BRGYHTML += '<option value="' + data[i].barangayCode + '">' + data[i].barangayName + '</option>';
                        }
                        $('#barangaySelect').html(BRGYHTML);
                    } else {
                        // Handle the case when no data is returned
                        console.log('No barangay data available.');
                    }
                }
            })
            //END:  PARAMETER: CITYICODE TO FETCH BARANGAY
            getLandInformationRemarks(data.LandInformationCode);
            stopLoading();
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}

function getOptDataForLandInformationUpdate(sourceLandInformation, filter, id, name, selected) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSelectedOptData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandInformation,
            id: id,
            name: name,
            filter: filter,
            selectedID: selected,
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var RAWHTML = '<option value="' + data.id + '" selected disabled>' + data.name + '</option>';
            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getOptData',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    username: $("#username").val(),
                    token: $("#token").val(),
                    dataSource: sourceLandInformation,
                    id: id,
                    name: name,
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    for (var i in data) {
                        RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
                    }
                    $('.' + id + '.triggerlandinformation').html(RAWHTML);
                },
                error: function () {
                    toastr.error('Error on gathering Options!');
                    stopLoading();
                }
            })
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}

function clearSelection(e) {
    $(e).select2('destroy').val('').select2();
}
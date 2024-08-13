$('.HTML_container').ready(function () {
    initDataLandowner('Landowner_Float');
    getSysAllLandownerData('Landowner_Float');
})
//START: DATA TABLE
/**
 * Description: This function initialize the data table set by ID.
 * 
 * @param {*} Data 
 */
function initDataLandowner(Data) {
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
 * @param {*} sourceLandowner 
 */
function getSysAllLandownerData(sourceLandowner) {
    showdatatablesLoader(sourceLandowner);
    var headcol = $('#tbl_' + sourceLandowner + ' thead tr th');
    var colid = [];
    for (var x in headcol) {
        if (headcol[x].className != undefined) {
            var y = headcol[x].className.split(' ');
            colid.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getFloatLandownerDataByStatus',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandowner,
            isactive: $('.statusFilter').is(':checked'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('landowner data', data);
            var datarow = [];
            $('#tbl_' + sourceLandowner).DataTable().clear().draw();
            for (var i in data) {
                console.log('data table LO', data[i].LandownerCode);
                var dataarr = [];
                for (var j in colid) {
                    if (colid[j] == 'id') {
                        if ( data[i].floatStatus == 1) {
                            dataarr.push('<div style="text-align:center">' +  
                                '<button type="button" onclick="viewLandownerData(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button>' +
                                '<button type="button" onclick="updateLandownerData(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].floatStatus + '\')" class="btn btn-outline-info btn-xs" style="width: 80px; margin-left: 10px; margin-right: 10px;">Update</button>' +
                                '</div>');
                        } else {
                            dataarr.push('<div style="text-align:center"><button type="button" onclick="viewLandownerData(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button></div>');
                        }
                        // dataarr.push('<div style="text-align:center"><button type="button" onclick="updateLandownerData(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
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
                        dataarr.push('<div style="text-align:center"><button class="btn btn-success-sm" onclick="showiFrame(\''+data[i][colid[j]]+'\')">' + data[i][colid[j]] + '</a></div>');
                    } else {
                        dataarr.push('<div style="text-align:center">' + data[i][colid[j]] + '</div>');
                    }
                }
                datarow.push(dataarr);
            }
            $('#tbl_' + sourceLandowner).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceLandowner);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceLandowner);
        }
    })
}
//END: DATA TABLE
//START: LANDOWNER FLOAT VIEW MODAL
function viewLandownerData(data, id, name) {
    showModal();
    ModalSize('xl');
    var title = 'View Landowner (<b class="selectedid" data-id="' + id + '">' + name + '</b>) ';
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
//END: LANDOWNER FLOAT VIEW MODAL
//START: LANDOWNER FLOAT VIEW REMARKS
function getLandownerRemarks() {
    var inputDataCollection = {
        LandownerCode: $('.LandownerCode').val(),
        username: $("#username").val(),
        token: $("#token").val(),
        dataSource: sourceLandowner,
        filter: dataSourceIdCol,
        FloatID: $('.selectedid').data('id'),
        sysapp,
        };
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLandownerRemarks',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(inputDataCollection),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('landowner remarks1',data);
            for (var i in data) {
                console.log('remarks', data[i].remarks);
                if ( data[i].remarks == '' ) {
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
//END: LANDOWNER FLOAT VIEW REMARKS
//START: LANDOWNER FLOAT UPDATE
//UPDATE MODAL
/**
 * Description: To update data of the specific table.
 * 
 * @param {*} data 
 * @param {*} id 
 * @param {*} name 
 * @param {*} status 
 */
function updateLandownerData(data, id, name, status) {
    console.log('update modal float status', status);
    showModal();
    ModalSize('xl');
    var title = 'Update Landowner <b class="selectedid" data-id="' + id + '">' + name + '</b> ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="updateLOData()"> Update</button >');
    title += '<b></b>';
    // if (status == 'true') {
    //     $('.modal-title').append('- <b style="color:green" class="status" data-status="1">Enabled</b>');
    //     $('.modal-footer').append('<button type="button" class="btn btn-danger enabledisabledata" onclick="enabledisabledata(\'' + data + '\')"> Disable</button >');
    // } else {
    //     $('.modal-title').append('- <b style="color:red" class="status" data-status="0">Disabled</b>');
    //     $('.modal-footer').append('<button type="button" class="btn btn-success enabledisabledata" onclick="enabledisabledata(\'' + data + '\')"> Enable</button >');
    // }
    if (Permission.includes(data + "_update") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' <em>(Read Only)</em>');
        $('.enabledisabledata').prop('disabled', 'true');
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
/**
 * Description: This function fetch the data for update view.
 * 
 * @param {*} sourceLandowner 
 * @param {*} filter 
 */
//DATA CRUD start
function getSysLandownerFloatingData(sourceLandowner, filter) {
    
    startLoading();
    var fields = $('.triggerlandowner');
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
            dataSource: sourceLandowner,
            filter: filter,
            selectedID: $('.selectedid').data('id'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('data update', data);

            if ( data.FirstName == null ) {
                $('#selectType').text('Company Information')
                $('.hideIndividual').hide()
                $('.hideCompany').show()
            } else {
                $('#selectType').text('Individual Information')
                $('.hideIndividual').show()
                $('.hideCompany').hide()
            }

            if ( data.CoOwner == null || data.CoOwner == '' ) {
                $('.showCoOwners').hide()
            } else {
                $('.showCoOwners').show()
            }

            for (var j in fieldID) {
                if ($('.' + fieldID[j] + '.triggerlandowner')[0].tagName == 'SELECT') {
                    var tagClasses = $('.' + fieldID[j] + '.triggerlandowner')[0].className.split(' ');
                    var optSource = tagClasses[2];
                    var optFilter = optSource + 'Code';
                    var name = tagClasses[1];
                    getOptDataForLandownerFloatingUpdate(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
                } else {
                    $('.' + fieldID[j]).val(data[fieldID[j]]);
                }
            }
            // if (Permission.includes(sourceLandowner + "_update") || excempted.includes($("#username").val())) {
            //     if ($('.status').data('status') == 0) {
            //         $('.triggerlandowner').prop('disabled', 'true');
            //     }
            // } else {
            //     $('.triggerlandowner').prop('disabled', 'true');
            // }

            //START: PARAMETER: PROVINCECODE TO FETCH CITY
            var provinceCode = data.provinceCode;
            $('#citySelect').append('<option value="-">loading...</option>');
            var CITYHTML = '<option value="'+data.cityCode+'" selected disabled>'+data.cityName+'</option>';
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
                    if ( data.length !== 0 ) {
                        for (var i in data) {
                            CITYHTML += '<option value="' + data[i].cityCode + '">' + data[i].cityName + '</option>';
                        }
                        $('#citySelect').html(CITYHTML);					
                    } else {
                        // Handle the case when no data is returned
                        console.log('No city data available.');
                    }
                }
            })
            //END: PARAMETER: PROVINCECODE TO FETCH CITY

            //START: PARAMETER: CITYICODE TO FETCH BARANGAY
            var cityCode = data.cityCode;
            $('#barangaySelect').append('<option value="-">loading...</option>');
            var BRGYHTML = '<option value="'+data.barangayCode+'" selected disabled>'+data.barangayName+'</option>';
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
                    if ( data.length !== 0 ) {
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
            getLandownerRemarks();
            stopLoading();
        },
        error: function (error) {
            console.error('Error fetching barangay data:', error);
        }
    })
}
/**
 * Description: This function updates the data of the specified row for update.
 * 
 * @param {*} sourceLandowner 
 * @param {*} filter 
 * @param {*} id 
 * @param {*} name 
 * @param {*} selected 
 */
function getOptDataForLandownerFloatingUpdate(sourceLandowner, filter, id, name, selected) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSelectedOptData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandowner,
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
                    dataSource: sourceLandowner,
                    id: id,
                    name: name,
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if ( data.length !== 0 ) {
                        for (var i in data) {
                            RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
                        }
                        $('.' + id + '.triggerlandowner').html(RAWHTML);
                    }
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
//END: LANDOWNER FLOAT UPDATE
$('.HTML_container').ready(function () {
    initDataLandInformation('LandInformation');
    getSysAllLandInformationData('LandInformation');
})

// START: LANDOWNER FUNCTIONS
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
        var htmlFilter = ' <datatablefilterbox><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
            'checked ' +
            'data-bootstrap-switch ' +
            'data-off-color="danger" ' +
            'data-on-color="success" ' +
            'data-on-text="Enabled" ' +
            'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllLandInformationData(\'' + Data + '\')" title="Reload Table"><i class="fas fa-redo-alt"></i> Reload</button>';
        $('#tbl_' + Data + '_filter').prepend(htmlFilter);
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
    if (Permission.includes(Data + "_add") || excempted.includes($("#username").val())) {
        $('#tbl_' + Data + '_filter').append(' <button class="btn btn-outline-success btn-sm addData" onclick="addLandInformationData(\'' + Data + '\')"><i class="fas fa-plus"></i> Add</button>');
    }
}

function addLandInformationData(data) {
    showModal();
    ModalSize('xl');
    var title = 'Create ' + data;
    // var title = 'Add ' + data;
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    if (data != 'SysUsers') {
        $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="saveLandInformationData(\'' + data + '\')"> Save ' + data + '</button >');
    } else {
        title = 'Add new User'
        $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="saveNewUser()"> Add User</button >');
    }
    $('.modal-title').html(title);
    $.ajax({
        url: $('#tbl_' + data).data('addpage'),
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

function saveLandInformationData(sourceLandInformation) {
    console.log($('.DocumentNumber').val());
    var documentNumber = $('.DocumentNumber').val();
    var fields = $('.triggerlandinformation');
    var fieldID = [];
    var inputData = {};
    var inputDataCollection = {};
    var owners = 0;
    var coowners = '';

    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }

    owners = $('.checkCoOwners').is(":checked") == true ? 1 : 0;
    coowners = $('.checkCoOwners').is(":checked") == false ? null : $('#textareaCoOwner').val();

    if (confirm('Save Landowner data?')) {
        inputDataCollection['username'] = $("#username").val();
        inputDataCollection['token'] = $("#token").val();
        inputDataCollection['dataSource'] = sourceLandInformation;
        inputDataCollection['sysapp'] = sysapp;
        inputData['cityCode'] = $('.cityCode').val();
        inputData['barangayCode'] = $('.barangayCode').val();
        inputData['CoOwner'] = coowners;
        inputData['WithCoOwner'] = owners;
        for (var j in fieldID) {
            inputData[fieldID[j]] = $('.triggerlandinformation.' + fieldID[j]).val();
            // $('.triggerlandinformation.' + fieldID[j]).val('');
        }

        inputDataCollection['inputData'] = inputData;
        console.log('data',inputDataCollection);
        
        if (documentNumber !== '') {
            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/checkDocumentNumber',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    DocumentNumber: documentNumber,
                    username: $("#username").val(),
                    token: $("#token").val(),
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.length !== 0 && data[""] === 1) {
                        toastr.error('Document Number already exists!');
                        // clearSelection('.LandownerCode, .DocumentTypeCode, .provinceCode, .cityCode, .barangayCode');
                        // $('.Hectare').val('');
                    } else {
                        $.ajax({
                            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/saveSysData',
                            type: 'post',
                            dataType: 'json',
                            data: JSON.stringify(inputDataCollection),
                            contentType: "application/json; charset=utf-8",
                            success: function (data) {
                                if (data.retval == 1) {
                                    getSysAllLandInformationData(sourceLandInformation);
                                    toastr.success('Data added!');
                                    hideModal();
                                } else {
                                    toastr.error('Duplicate Code!');
                                    stopLoading();
                                }
                            },
                            error: function () {
                                toastr.error('Error on saving data!');
                                stopLoading();
                            }
                        })
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error('Error checking Document Number. Please try again later.');
                }
            });
        } else {
            toastr.error('Please enter Document Number!');
        }
    }
}

function clearSelection(e) {
    $(e).select2('destroy').val('').select2();
}

function getOptDataForAddLandInformation() {
    var fields = $('.triggerlandinformation');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggerlandinformation')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggerlandinformation')[0].className.split(' ');
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];
            var RAWHTML = '<option disabled selected>-</option>';
            getOptDataForAddLandInformationAppend(optSource,optId,optName,RAWHTML);
        }
    }
}

function getOptDataForAddLandInformationAppend(optSource,optId,optName,RAWHTML){
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getOptData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: optSource,
            id: optId,
            name: optName,
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            for (var i in data) {
                RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
            }
            $('.' + optSource + '.triggerlandinformation').html(RAWHTML);
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}

//START: trigger multiple landowners
function getOptDataForAddLandInformationMultiple() {
    var fields = $('.triggermultiple');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggermultiple')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggermultiple')[0].className.split(' ');
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];
            var RAWHTML = '';
            getOptDataForAddMultipleLandInformationAppend(optSource,optId,optName,RAWHTML);
        }
    }
}

function getOptDataForAddMultipleLandInformationAppend(optSource,optId,optName,RAWHTML){
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getOptData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: optSource,
            id: optId,
            name: optName,
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            for (var i in data) {
                RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
            }
            $('.' + optSource + '.triggermultiple').html(RAWHTML);
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}
//END: trigger multiple landowners

//UPDATE LANDOWNER
function getSysAllLandInformationData(sourceLandInformation) {
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
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysAllData',
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
            var datarow = [];
            $('#tbl_' + sourceLandInformation).DataTable().clear().draw();
            for (var i in data) {
                var dataarr = [];
                for (var j in colid) {
                    if (colid[j] == 'id') {
                        dataarr.push('<div style="text-align:center"><button type="button" onclick="updateLandInformationData(\'' + sourceLandInformation + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
                    } else if (colid[j] == 'isactive') {
                        if (data[i][colid[j]]) {
                            dataarr.push('<div style="text-align:center;color:green"><b>Enabled</b></div>');
                        } else {
                            dataarr.push('<div style="text-align:center;color:red"><b>Disabled</b></div>');
                        }
                    } else if (colid[j] == 'geoLocation') {
                        //dataarr.push('<div style="text-align:center"><a href="https://www.google.com/maps/place/' + data[i][colid[j]] + '" target="_blank">' + data[i][colid[j]] + '</a></div>');
                        dataarr.push('<div style="text-align:center"><button class="btn btn-success-sm" onclick="showiFrame(\''+data[i][colid[j]]+'\')">' + data[i][colid[j]] + '</a></div>');
                        
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

//UPDATE MODAL
function updateLandInformationData(data, id, name, status) {
    showModal();
    ModalSize('xl');
    var title = 'Update ' + data + ' <b class="selectedid" data-id="' + id + '">(' + name + ')</b> ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    title += '<b></b>';
    if (status == 'true') {
        $('.modal-title').append('- <b style="color:green" class="status" data-status="1">Enabled</b>');
        $('.modal-footer').append('<button type="button" class="btn btn-danger enabledisabledata" onclick="enabledisabledata(\'' + data + '\')"> Disable</button >');
    } else {
        $('.modal-title').append('- <b style="color:red" class="status" data-status="0">Disabled</b>');
        $('.modal-footer').append('<button type="button" class="btn btn-success enabledisabledata" onclick="enabledisabledata(\'' + data + '\')"> Enable</button >');
    }
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

//DATA CRUD start
function getSysLandInformationData(sourceLandInformation, filter) {
    
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

            if ( data.WithCoOwner == false) {
                $('.hideCoOwner').hide();
            } else {
                $('.hideCoOwner').show();
            }

            if ( data.DocumentTypeCode != 3 ) {
                $('#hideRemarks').hide();
            } else {
                $('#hideRemarks').show();
            }

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

// START: SHOW DATA MULTIPLE:SELECT
// function getSysLandInformationDataMultiple(sourceLandInformation, filter) {
    
//     startLoading();
//     var fields = $('.triggermultiple');
//     var fieldID = [];
//     for (var x in fields) {
//         if (fields[x].className != undefined) {
//             var y = fields[x].className.split(' ');
//             fieldID.push(y[0]);
//         }
//     }
//     $.ajax({
//         url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysData',
//         type: 'post',
//         dataType: 'json',
//         data: JSON.stringify({
//             username: $("#username").val(),
//             token: $("#token").val(),
//             dataSource: sourceLandInformation,
//             filter: filter,
//             selectedID: $('.selectedid').data('id'),
//             sysapp: sysapp
//         }),
//         contentType: "application/json; charset=utf-8",
//         success: function (data) {
//             for (var j in fieldID) {
//                 if ($('.' + fieldID[j] + '.triggermultiple')[0].tagName == 'SELECT') {
//                     var tagClasses = $('.' + fieldID[j] + '.triggermultiple')[0].className.split(' ');
//                     var optSource = tagClasses[2];
//                     var optFilter = optSource + 'Code';
//                     var name = tagClasses[1];
//                     // console.log(name);
//                     getOptDataForLandInformationUpdate(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
//                 } else {
//                     $('.' + fieldID[j]).val(data[fieldID[j]]);
//                     // console.log($('.' + fieldID[j]).val(data[fieldID[j]]));
//                 }
//             }
//             if (Permission.includes(sourceLandInformation + "_update") || excempted.includes($("#username").val())) {
//                 if ($('.status').data('status') == 0) {
//                     $('.triggermultiple').prop('disabled', 'true');
//                 }
//             } else {
//                 $('.triggermultiple').prop('disabled', 'true');
//             }
//             stopLoading();
//         },
//         error: function () {
//             toastr.error('Data gathering error!');
//             stopLoading();
//         }
//     })
// }

// function getOptDataForLandInformationUpdate(sourceLandInformation, filter, id, name, selected) {
//     $.ajax({
//         url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSelectedOptData',
//         type: 'post',
//         dataType: 'json',
//         data: JSON.stringify({
//             username: $("#username").val(),
//             token: $("#token").val(),
//             dataSource: sourceLandInformation,
//             id: id,
//             name: name,
//             filter: filter,
//             selectedID: selected,
//             sysapp: sysapp
//         }),
//         contentType: "application/json; charset=utf-8",
//         success: function (data) {
//             var RAWHTML = '<option value="' + data.id + '" selected disabled>' + data.name + '</option>';
//             $.ajax({
//                 url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getOptData',
//                 type: 'post',
//                 dataType: 'json',
//                 data: JSON.stringify({
//                     username: $("#username").val(),
//                     token: $("#token").val(),
//                     dataSource: sourceLandInformation,
//                     id: id,
//                     name: name,
//                     sysapp: sysapp
//                 }),
//                 contentType: "application/json; charset=utf-8",
//                 success: function (data) {
//                     for (var i in data) {
//                         RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
//                     }
//                     $('.' + id + '.triggermultiple').html(RAWHTML);
//                 },
//                 error: function () {
//                     toastr.error('Error on gathering Options!');
//                     stopLoading();
//                 }
//             })
//         },
//         error: function () {
//             toastr.error('Data gathering error!');
//             stopLoading();
//         }
//     })
// }
// END: SHOW DATA MULTIPLE:SELECT

// START: MULTIPLE SELECT: UPDATE
// function getSysLandInformationDataMultipleUpdate(sourceLandInformation, filter) {
    
//     startLoading();
//     var fields = $('.triggermultiple');
//     var fieldID = [];
//     for (var x in fields) {
//         if (fields[x].className != undefined) {
//             var y = fields[x].className.split(' ');
//             fieldID.push(y[0]);
//         }
//     }
//     $.ajax({
//         url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysData',
//         type: 'post',
//         dataType: 'json',
//         data: JSON.stringify({
//             username: $("#username").val(),
//             token: $("#token").val(),
//             dataSource: sourceLandInformation,
//             filter: filter,
//             selectedID: $('.selectedid').data('id'),
//             sysapp: sysapp
//         }),
//         contentType: "application/json; charset=utf-8",
//         success: function (data) {
//             for (var j in fieldID) {
//                 if ($('.' + fieldID[j] + '.triggermultiple')[0].tagName == 'SELECT') {
//                     var tagClasses = $('.' + fieldID[j] + '.triggermultiple')[0].className.split(' ');
//                     var optSource = tagClasses[2];
//                     var optFilter = optSource + 'Code';
//                     var name = tagClasses[1];
//                     getOptDataForLandInformationUpdateMultiple(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
//                 } else {
//                     $('.' + fieldID[j]).val(data[fieldID[j]]);
//                 }
//             }
//             if (Permission.includes(sourceLandInformation + "_update") || excempted.includes($("#username").val())) {
//                 if ($('.status').data('status') == 0) {
//                     $('.triggermultiple').prop('disabled', 'true');
//                 }
//             } else {
//                 $('.triggermultiple').prop('disabled', 'true');
//             }
//             stopLoading();
//         },
//         error: function () {
//             toastr.error('Data gathering error!');
//             stopLoading();
//         }
//     })
// }

// function getOptDataForLandInformationUpdateMultiple(sourceLandInformation, filter, id, name, selected) {
//     // console.log('data', sourceLandInformation, filter, id, name, selected);
//     $.ajax({
//         url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSelectedOptData',
//         type: 'post',
//         dataType: 'json',
//         data: JSON.stringify({
//             username: $("#username").val(),
//             token: $("#token").val(),
//             dataSource: sourceLandInformation,
//             id: id,
//             name: name,
//             filter: filter,
//             // selectedID: {selected},
//             selectedID: selected,
//             sysapp: sysapp
//         }),
//         contentType: "application/json; charset=utf-8",
//         success: function (data) {
//             var RAWHTML = '<option value="' + data.id + '" selected disabled>' + data.name + '</option>';
//             $.ajax({
//                 url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getOptData',
//                 type: 'post',
//                 dataType: 'json',
//                 data: JSON.stringify({
//                     username: $("#username").val(),
//                     token: $("#token").val(),
//                     dataSource: sourceLandInformation,
//                     id: id,
//                     name: name,
//                     sysapp: sysapp
//                 }),
//                 contentType: "application/json; charset=utf-8",
//                 success: function (data) {
//                     for (var i in data) {
//                         RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
//                     }
//                     $('.' + id + '.triggermultiple').html(RAWHTML);
//                 },
//                 error: function () {
//                     toastr.error('Error on gathering Options!');
//                     stopLoading();
//                 }
//             })
//         },
//         error: function () {
//             toastr.error('Data gathering error!');
//             stopLoading();
//         }
//     })
// }
// END: MULTIPLE SELECT: UPDATE
// END: LANDOWNER FUNCTIONS
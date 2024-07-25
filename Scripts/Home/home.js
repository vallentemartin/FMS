$('.HTML_container').ready(function () {
    initDataLandowner('Landowner_Float');
    getSysAllLandownerData('Landowner_Float');
    initDataLandInformation('LandInformation_Float');
    getSysAllLandInfoData('LandInformation_Float')
    initDataContractInfo('ContractMain_Float');
    getSysAllContractInfoData('ContractMain_Float');
})


$('.role').ready(function () {
    console.log(1, Permission);
    setTimeout(function () {
        loadHomeContent();
        getPaymentOverdue();
        console.log('load na');

    }, 1000);
    console.log(3, Permission);
    getLDMSDashboardData();



})


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
            [5, 25, 50, 100],
            ['5 rows', '25 rows', '50 rows', '100 rows']
        ],
        buttons: [
            // "pageLength",
            "colvis"
            // {
            //     extend: 'excelHtml5',
            //     title: Data + 'Export'
            // }
        ]
    }).buttons().container().appendTo('#tbl_' + Data + '_wrapper .col-md-6:eq(0)');
    $('#tbl_' + Data + '_paginate').css('font-size', 'smaller').css('float', 'right');
    $('#tbl_' + Data + '_filter').css('float', 'right');
    if (Data != 'SysUsers' && Data != 'Period' && Data != 'Calendar') {
        // var htmlFilter = ' <datatablefilterbox><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
        //     'checked hidden></datatablefilterbox> ';
        var htmlFilter = ' <datatablefilterbox hidden><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
            'checked ' +
            'data-bootstrap-switch ' +
            'data-off-color="danger" ' +
            'data-on-color="success" ' +
            'data-on-text="Enabled" ' +
            'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllLandownerData(\'' + Data + '\')" title="Reload Table" hidden><i class="fas fa-redo-alt"></i> Reload</button>';
        $('#tbl_' + Data + '_filter').prepend(htmlFilter);
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
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLandownerForApprovalStatus',
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
                var dataarr = [];
                for (var j in colid) {
                    console.log('float coldid', colid);
                    console.log('float data', data[i]);
                    console.log('float data landowner', data[i].LandownerCode);
                    console.log('float status', data[i].floatStatus);
                    if (colid[j] == 'id') {
                        if (Permission.includes('Landowner_viewButtonsLDMS') || excempted.includes($("#username").val())) {
                            dataarr.push('<div style="text-align:center">' +
                            '<button type="button" onclick="viewLandownermodal(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 30px; margin-right: 10px;" title="View"><i class="fas fa-eye"></i></button>' +
                            '<button type="button" onclick="approvedLandownermodal(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandownerCode + '\')" class="btn btn-outline-success btn-xs" style="width: 30px; margin-right: 10px;" title="Approve"><i class="far fa-thumbs-up"></i></button>' +
                            '<button type="button" onclick="returnedLandownermodal(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandownerCode + '\')" class="btn btn-outline-danger btn-xs" style="width: 30px; margin-right: 10px;" title="Return"><i class="fas fa-undo"></i></button>' +
                            '<button type="button" onclick="disapproveLandownermodal(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandownerCode + '\')" class="btn btn-outline-danger btn-xs" style="width: 30px; margin-right: 10px;" title="Disapprove"><i class="fas fa-thumbs-down"></i></button>' +
                            '</div>');
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
                                dataarr.push('<div style="text-align:center;color:red"><b>Error Status</b></div>');
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
            $('#tbl_' + sourceLandowner).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceLandowner);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceLandowner);
        }
    })
}
/**
 * Description: This function initialize the data table set by ID.
 * 
 * @param {*} Data 
 */
function initDataLandInformation(Data) {
    console.log('initialize LI', Data);
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
            [5, 25, 50, 100],
            ['5 rows', '25 rows', '50 rows', '100 rows']
        ],
        buttons: [
            // "pageLength",
            "colvis"
            // {
            //     extend: 'excelHtml5',
            //     title: Data + 'Export'
            // }
        ]
    }).buttons().container().appendTo('#tbl_' + Data + '_wrapper .col-md-6:eq(0)');
    $('#tbl_' + Data + '_paginate').css('font-size', 'smaller').css('float', 'right');
    $('#tbl_' + Data + '_filter').css('float', 'right');
    if (Data != 'SysUsers' && Data != 'Period' && Data != 'Calendar') {
        // var htmlFilter = ' <datatablefilterbox><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
        //     'checked hidden></datatablefilterbox> ';
        var htmlFilter = ' <datatablefilterbox hidden><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
            'checked ' +
            'data-bootstrap-switch ' +
            'data-off-color="danger" ' +
            'data-on-color="success" ' +
            'data-on-text="Enabled" ' +
            'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllLandInfoData(\'' + Data + '\')" title="Reload Table" hidden><i class="fas fa-redo-alt"></i> Reload</button>';
        $('#tbl_' + Data + '_filter').prepend(htmlFilter);
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
}
/**
 * Description: This function fetch the data of the specific table
 * 
 * @param {*} sourceLandInfo 
 */
function getSysAllLandInfoData(sourceLandInfo) {
    console.log('get sys LI', sourceLandInfo);
    showdatatablesLoader(sourceLandInfo);
    var headcol = $('#tbl_' + sourceLandInfo + ' thead tr th');
    var colid = [];
    for (var x in headcol) {
        if (headcol[x].className != undefined) {
            var y = headcol[x].className.split(' ');
            colid.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLandInfoForApprovalStatus',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandInfo,
            isactive: $('.statusFilter').is(':checked'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('landowner data', data);
            var datarow = [];
            $('#tbl_' + sourceLandInfo).DataTable().clear().draw();
            for (var i in data) {
                var dataarr = [];
                for (var j in colid) {
                    console.log('float coldid', colid);
                    console.log('float data', data[i]);
                    console.log('float data land info', data[i].LandownerCode);
                    console.log('float status', data[i].Status);
                    if (colid[j] == 'id') {
                        if ( Permission.includes('LandInformation_viewButtonsLDMS') || excempted.includes($("#username").val()) ) {
                            dataarr.push('<div style="text-align:center">' +
                            '<button type="button" onclick="viewLandInfomodal(\'' + sourceLandInfo + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 30px; margin-right: 10px;" title="View"><i class="fas fa-eye"></i></button>' +
                            '<button type="button" onclick="approvedLandInfomodal(\'' + sourceLandInfo + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandownerCode + '\')" class="btn btn-outline-success btn-xs" style="width: 30px; margin-right: 10px;" title="Approve"><i class="far fa-thumbs-up"></i></button>' +
                            '<button type="button" onclick="returnedLandInfomodal(\'' + sourceLandInfo + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandownerCode + '\')" class="btn btn-outline-danger btn-xs" style="width: 30px; margin-right: 10px;" title="Return"><i class="fas fa-undo"></i></button>' +
                            '<button type="button" onclick="disapprovedLandInformodal(\'' + sourceLandInfo + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandownerCode + '\')" class="btn btn-outline-danger btn-xs" style="width: 30px; margin-right: 10px;" title="Disapprove"><i class="fas fa-thumbs-down"></i></button>' +
                            '</div>');
                        }
                        // dataarr.push('<div style="text-align:center"><button type="button" onclick="updateLandownerData(\'' + sourceLandInfo + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
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
            $('#tbl_' + sourceLandInfo).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceLandInfo);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceLandInfo);
        }
    })
}
/**
 * Description: This function initialize the data table set by ID.
 * 
 * @param {*} Data 
 */
function initDataContractInfo(Data) {
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
            [5, 25, 50, 100],
            ['5 rows', '25 rows', '50 rows', '100 rows']
        ],
        buttons: [
            // "pageLength",
            "colvis"
            // {
            //     extend: 'excelHtml5',
            //     title: Data + 'Export'
            // }
        ]
    }).buttons().container().appendTo('#tbl_' + Data + '_wrapper .col-md-6:eq(0)');
    $('#tbl_' + Data + '_paginate').css('font-size', 'smaller').css('float', 'right');
    $('#tbl_' + Data + '_filter').css('float', 'right');
    if (Data != 'SysUsers' && Data != 'Period' && Data != 'Calendar') {
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
}
/**
 * Description: This function fetch the data of the specific table
 * 
 * @param {*} sourceContract 
 */
function getSysAllContractInfoData(sourceContract) {
    showdatatablesLoader(sourceContract);
    var headcol = $('#tbl_' + sourceContract + ' thead tr th');
    var colid = [];
    for (var x in headcol) {
        if (headcol[x].className != undefined) {
            var y = headcol[x].className.split(' ');
            colid.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getContractsPendingStatus',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceContract,
            isactive: $('.statusFilter').is(':checked'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('sakpan', data);
            var datarow = [];
            $('#tbl_' + sourceContract).DataTable().clear().draw();
            for (var i in data) {
                var dataarr = [];
                for (var j in colid) {
                    console.log('float coldid', colid);
                    console.log('float data', data[i]);
                    // console.log('float data land info', data[i].LandownerCode);
                    // console.log('float status', data[i].Status);
                    if (colid[j] == 'id') {
                        if (Permission.includes('Contracts_viewButtonsLDMS') || excempted.includes($("#username").val())) {
                            dataarr.push('<div style="text-align:center">' +
                                '<button type="button" onclick="viewLandContractData(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 30px; margin-right: 10px;" title="View"><i class="fas fa-eye"></i></button>' + 
                                '<button type="button" onclick="approvedLandContractmodal(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandContractCode + '\')" class="btn btn-outline-success btn-xs" style="width: 30px; margin-right: 10px;" 10px; margin-right: 10px;" title="Approve"><i class="far fa-thumbs-up"></i></button>' +
                                '<button type="button" onclick="returnedContractmodal(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandContractCode + '\')" class="btn btn-outline-danger btn-xs" style="width: 30px; margin-right: 10px;" title="Return"><i class="fas fa-undo"></i></buttons>' +
                                '<button type="button" onclick="disapprovedContractmodal(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].LandContractCode + '\')" class="btn btn-outline-danger btn-xs" style="width: 30px; margin-right: 10px;" title="Disapprove"><i class="fas fa-thumbs-down"></i></button>' +
                                '</div>');
                        } else {
                            toastr.error('Permission Denied!');
                        }
                    } else if (colid[j] == 'Status') {
                        switch (data[i].Status) {
                            case 0:
                                dataarr.push('<div style="text-align:center;color:#155724"><b>Active</b></div>');
                                break;
                            case 1:
                                dataarr.push('<div style="text-align:center;color:#b08900"><b>Expiring</b></div>');
                                break;
                            case 2:
                                dataarr.push('<div style="text-align:center;color:#d9534f"><b>Expired</b></div>');
                                break;
                            case 3:
                                dataarr.push('<div style="text-align:center;color:#007bff"><b>Renewed</b></div>');
                                break;
                            case 4:
                                dataarr.push('<div style="text-align:center;color:#b85c00"><b>Pre-Term</b></div>');
                                break;
                            case 5:
                                dataarr.push('<div style="text-align:center;color:#8b0000"><b>Terminated</b></div>');
                                break;
                            default:
                                dataarr.push('<div style="text-align:center;color:#A5C18A"><b>Error Status</b></div>');
                                break;
                        }                        
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
            $('#tbl_' + sourceContract).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceContract);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceContract);
        }
    })
}
//START: LANDOWNER APPROVAL MODAL
function approvedLandownermodal(sourceLandowner, id, name, LandownerCode) {
    console.log('modal sourcedata', sourceLandowner);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal Landowner', LandownerCode);

    showModal();
    ModalSize('m');
    var title = 'Approve Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' +
        '<button type="button" class="btn btn-success" onclick="approvelandownerRemarks(\'' + sourceLandowner + '\',\'' + id + '\',\'' + LandownerCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandowner).data('approvepage'),
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
//END: LANDOWNER APPROVAL MODAL
//START: LANDOWNER APPROVAL FUNCTION
function approvelandownerRemarks(sourceLandowner, id, LandownerCode) {
    console.log('approve source landowner', sourceLandowner);
    console.log('approve id', id);
    console.log('approve landownercode', LandownerCode);
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/approveFloatingLandownerData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandowner,
            sysapp: sysapp,
            FloatLOID: id,
            LandownerCode: LandownerCode,
            approvedRemarks: $('#approveRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('approved landowner', data);
            hideModal();
            getSysAllLandownerData(sourceLandowner);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LANDOWNER APPROVAL FUNCTION
//START: LANDOWNER RETURN MODAL
function returnedLandownermodal(sourceLandowner, id, name, LandownerCode) {
    console.log('modal sourcedata', sourceLandowner);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal LandownerCode', LandownerCode);

    showModal();
    ModalSize('m');
    var title = 'Return Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' +
        '<button type="button" class="btn btn-success" onclick="returnLandownerRemarks(\'' + sourceLandowner + '\',\'' + id + '\',\'' + LandownerCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandowner).data('returnpage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
            $('#name').text(name);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//END: LANDOWNER RETURN MODAL
//START: LANDOWNER RETURN FUNCTION
function returnLandownerRemarks(sourceLandowner, id, LandownerCode) {

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/returnFloatingLandownerData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandowner,
            sysapp: sysapp,
            FloatLOID: id,
            LandownerCode: LandownerCode,
            returnedRemarks: $('#returnRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('return', data);
            hideModal();
            getSysAllLandownerData(sourceLandowner);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LANDOWNER RETURN FUNCTION
//START: LANDOWNER DISAPPROVE MODAL
function disapproveLandownermodal(sourceLandowner, id, name, LandownerCode) {
    console.log('modal sourcedata', sourceLandowner);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal LandownerCode', LandownerCode);

    showModal();
    ModalSize('m');
    var title = 'Disapprove Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="disapproveLandownerRemarks(\'' + sourceLandowner + '\',\'' + id + '\',\'' + LandownerCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandowner).data('disapprovepage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
            $('#name').text(name);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//END: LANDOWNER DISAPPROVE MODAL
//START: LANDOWNER DISAPPROVE FUNCTION
function disapproveLandownerRemarks(sourceLandowner, id, LandownerCode) {

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/disapproveFloatingLandownerData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandowner,
            sysapp: sysapp,
            FloatLOID: id,
            LandownerCode: LandownerCode,
            disapproveddRemarks: $('#disapproveRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('disapprove',data);
            hideModal();
            getSysAllLandownerData(sourceLandowner);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LANDOWNER DISAPPROVE FUNCTION
//START: LAND INFORMATION APPROVAL MODAL
function approvedLandInfomodal(sourceLandInfo, id, name, LandownerCode) {
    console.log('modal sourcedata', sourceLandInfo);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal Landowner', LandownerCode);

    showModal();
    ModalSize('m');
    var title = 'Approve Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="approvelandinformationRemarks(\'' + sourceLandInfo + '\',\'' + id + '\',\'' + LandownerCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandInfo).data('approvepage'),
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
//END: LAND INFORMATION APPROVAL MODAL
//START: LAND INFORMATION APPROVAL FUNCTION
function approvelandinformationRemarks(sourceLandInfo, id, LandownerCode) {
    console.log('approve source landowner', sourceLandInfo);
    console.log('approve id', id);
    console.log('approve landownercode', LandownerCode);
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/approveFloatingLandInformationData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandInfo,
            sysapp: sysapp,
            FloatLIID: id,
            LandownerCode: LandownerCode,
            approvedRemarks: $('#approveRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('approved landowner',data);
            hideModal();
            getSysAllLandInfoData(sourceLandInfo);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LAND INFORMATION APPROVAL FUNCTION
//START: LAND CONTRACT INFORMATION APPROVAL MODAL
function approvedLandContractmodal(sourceContract, id, name, LandContractCode) {
    console.log('modal sourcedata', sourceContract);
    console.log('modal id', id);
    console.log('modal name', name);

    showModal();
    ModalSize('m');
    var title = 'Approve Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="approvecontractsRemarks(\'' + sourceContract + '\',\'' + id + '\',\'' + LandContractCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceContract).data('approvepage'),
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
//END: LAND CONTRACT INFORMATION APPROVAL MODAL
//START: LAND CONTRACT INFORMATION APPROVE FUNCTION
function approvecontractsRemarks(sourceContract, id, LandContractCode) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/approveFloatingLandContractData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceContract,
            FloatLCID: id,
            sysapp: sysapp,
            LandContractCode: LandContractCode,
            approvedRemarks: $('#approveRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('approved', data);
            hideModal();
            getSysAllContractInfoData(sourceContract);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LAND CONTRACT INFORMATION APPROVE FUNCTION
//START: LAND INFORMATION RETURN MODAL
function returnedLandInfomodal(sourceLandInfo, id, name, LandownerCode) {
    console.log('modal sourcedata', sourceLandInfo);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal LandownerCode', LandownerCode);

    showModal();
    ModalSize('m');
    var title = 'Return Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="returnLandInformationRemarks(\'' + sourceLandInfo + '\',\'' + id + '\',\'' + LandownerCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandInfo).data('returnpage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
            $('#name').text(name);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//END: LAND INFORMATION RETURN MODAL
//START: LAND INFORMATION RETURN FUNCTION
function returnLandInformationRemarks(sourceLandInfo, id, LandownerCode) {

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/returnFloatingLandInformationData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandInfo,
            sysapp: sysapp,
            FloatLIID: id,
            LandownerCode: LandownerCode,
            returnedRemarks: $('#returnRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('return',data);
            hideModal();
            getSysAllLandInfoData(sourceLandInfo);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LAND INFORMATION RETURN FUNCTION
//START: LAND CONTRACT INFROMATION RETURN MODAL
function returnedContractmodal(sourceLandInfo, id, name, LandContractCode) {
    console.log('modal sourcedata', sourceLandInfo);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal LandContractCode', LandContractCode);

    showModal();
    ModalSize('m');
    var title = 'Return Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="returnLandInformationRemarks(\'' + sourceLandInfo + '\',\'' + id + '\',\'' + LandContractCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandInfo).data('returnpage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
            $('#name').text(name);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
function returnLandContractRemarks(sourceContract, id, LandContractCode) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/returnFloatingLandContractData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceContract,
            sysapp: sysapp,
            FloatLCID: id,
            LandContractCode: LandContractCode,
            returnedRemarks: $('#returnRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('return', data);
            hideModal();
            getSysAllContractInfoData(sourceContract);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LAND CONTRACT INFROMATION RETURN MODAL
//START: LANDOWNER DISAPPROVE MODAL
function disapprovedLandInformodal(sourceLandInfo, id, name, LandownerCode) {
    console.log('modal sourcedata', sourceLandInfo);
    console.log('modal id', id);
    console.log('modal name', name);
    console.log('modal LandownerCode', LandownerCode);

    showModal();
    ModalSize('m');
    var title = 'Disapprove Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="disapproveLandInfoRemarks(\'' + sourceLandInfo + '\',\'' + id + '\',\'' + LandownerCode + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceLandInfo).data('disapprovepage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
            $('#name').text(name);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//END: LANDOWNER DISAPPROVE MODAL
//START: LANDOWNER DISAPPROVE FUNCTION
function disapproveLandInfoRemarks(sourceLandInfo, id, LandownerCode) {

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/disapproveFloatingLandInformationData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandInfo,
            sysapp: sysapp,
            FloatLIID: id,
            LandownerCode: LandownerCode,
            disapprovedRemarks: $('#disapproveRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('disapprove',data);
            hideModal();
            getSysAllLandownerData(sourceLandInfo);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
//END: LANDOWNER DISAPPROVE FUNCTION
function viewLandContractData(data, id, name, status) {
    console.log('data', data);
    console.log('id', id);
    console.log('name', name);
    console.log('status', status);
    showModal();
    ModalSize('xl');
    var title = 'View Contract <b class="selectedid" data-id="' + id + '">(' + name + ')</b> ';
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
    if (Permission.includes(data + "_view") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' <em style="color:#088C08">(Read Only)</em>');
        $('.enabledisabledata').prop('disabled', 'true');
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
/**
 * Description: View Data for Contracts
 * 
 * @param {*} sourceContract 
 * @param {*} filter 
 */
function viewContractInfoData(sourceContract, filter) {
    console.log('function parameters 1', sourceContract);
    console.log('function parameters 2', filter);
    startLoading();
    var fields = $('.triggercontractinfoview');
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
            dataSource: sourceContract,
            filter: filter,
            selectedID: $('.selectedid').data('id'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.table('Land Information data troubleshoot', data);
            var LandInformationCode = data.LandInformationCode;
            // var LandContractCode = data.LandContractCode;
            console.log(LandInformationCode);
            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getContractInfoData',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    data: data,
                    LandInformationCode: data.LandInformationCode,
                    username: $("#username").val(),
                    token: $("#token").val(),
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (viewdata) {
                    
                    viewContract = {
                        contractdata: data,
                        landinformationdata: viewdata
                    };
                    console.log('view data', viewContract);

                    //view contract data
                    $('.name').text(viewContract.contractdata.Fullname);
                    $('.landdocument').text(viewContract.landinformationdata.Document);
                    $('.landlotnumber').text(viewContract.landinformationdata.LotNumber);
                    $('.LandContractCode').text(viewContract.contractdata.LandContractCode);

                    if (viewContract.landinformationdata.WithCoOwner == true) {
                        $('.hideCoOwner').show();
                        $('.CoOwner').text(viewContract.landinformationdata.CoOwner);
                    } else {
                        $('.hideCoOwner').hide();
                        $('.CoOwner').text('');
                    }

                    if (viewContract.contractdata.RepresentativeName == '') {
                        $('.hideRepresentativeLabel').hide();
                    } else {
                        $('.hideRepresentativeLabel').show();
                        $('.RepName').text(viewContract.contractdata.RepresentativeName);
                        $('.RepContactNumber').text(viewContract.contractdata.RepresentativeContactNumber);
                        $('.RepEmail').text(viewContract.contractdata.RepresentativeEmail);
                    }

                    $('.province').text(viewContract.landinformationdata.provinceName);
                    $('.city').text(viewContract.landinformationdata.cityName);
                    $('.barangay').text(viewContract.landinformationdata.barangayName);
                    $('.landtotalarea').text(viewContract.landinformationdata.Area);
                    $('.landplantation').text(viewContract.contractdata.PlantationCode);
                    $('.landcompany').text(viewContract.contractdata.CompanyCode + ' - ' + viewContract.contractdata.Companyname);
                    $('.landcontractedarea').text(viewContract.contractdata.LandContractedArea);
                }
            })
            stopLoading();
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}

//////////////////////////////////////////////////////////////////////////////////////////Start: LOAD LDMS CONTEXT//////////////////////////////////////////////////////////////////////////////////////////
function loadHomeContent() {
    var section = '';
    // var LDMSheader = '';
    var LDMSREPORT = Permission.includes('LDMSDashboard_role'); // if role exsist
    section = LDMSREPORT === true ? $('#LDMSDashboard_role').show() : $('#LDMSDashboard_role').hide(); // hide/show role
    // LDMSheader = $('#LDMSchartbutton').data().card('widget') == 'collapse' ? $('hideLDMSheader').show() : $('hideLDMSheader').hide()
    console.log(2, Permission);

}
//////////////////////////////////////////////////////////////////////////////////////////End: LOAD LDMS CONTEXT//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////Start: LOAD LDMS DASHBOARD DATA//////////////////////////////////////////////////////////////////////////////////////////
function getLDMSDashboardData() {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLDMSDashboardData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('dashboard Info', data);

            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLDMSGraph',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    username: $("#username").val(),
                    token: $("#token").val(),
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    console.log('ldms graph', data);
                    var barPlantationCode = [];
                    var barActiveContracts = [];
                    var barExpiringContracts = [];
                    // var barInactiveContracts = [];
                    var barTerminatedContracts = [];

                    for (var j in data) {
                        barPlantationCode.push(data[j].PlantationCode);
                        barActiveContracts.push(data[j].ActiveContracts);
                        barExpiringContracts.push(data[j].ExpiringContracts);
                        // barInactiveContracts.push(data[j].InactiveContracts);
                        barTerminatedContracts.push(data[j].TerminatedContracts);
                    }

                    // Get context with jQuery - using jQuery's .get() method.
                    var barChartCanvas = $('#barChart').get(0).getContext('2d')
                    var barData = {
                        labels: barPlantationCode,
                        datasets: [
                            {
                                label: 'Expiring',
                                backgroundColor: 'rgb(255,177,129)',
                                borderColor: 'rgb(255,177,129)',
                                pointRadius: false,
                                pointColor: '#FFFF93',
                                pointStrokeColor: '#FFFF93',
                                pointHighlightFill: 'rgb(255,177,129)',
                                pointHighlightStroke: 'rgb(255,177,129)',
                                data: barExpiringContracts
                            },
                            {
                                label: 'Active',
                                backgroundColor: 'rgb(130,218,92)',
                                borderColor: 'rgb(130,218,92)',
                                pointRadius: false,
                                pointColor: 'rgb(130,218,92)',
                                pointStrokeColor: 'rgb(130,218,92)',
                                pointHighlightFill: 'rgb(130,218,92)',
                                pointHighlightStroke: 'rgb(130,218,92)',
                                data: barActiveContracts
                            },
                            // {
                            // label               : 'Inactive',
                            // backgroundColor     : 'rgb(255,120,129)',
                            // borderColor         : 'rgb(255,120,129)',
                            // pointRadius         : false,
                            // pointColor          : 'rgb(255,120,129)',
                            // pointStrokeColor    : 'rgb(255,120,129)',
                            // pointHighlightFill  : 'rgb(255,120,129)',
                            // pointHighlightStroke: 'rgb(255,120,129)',
                            // data                : barInactiveContracts
                            // },
                            {
                                label: 'Terminated',
                                backgroundColor: 'rgb(255,120,129)',
                                borderColor: 'rgb(255,120,129)',
                                pointRadius: false,
                                pointColor: 'rgb(255,120,129)',
                                pointStrokeColor: 'rgb(255,120,129)',
                                pointHighlightFill: 'rgb(255,120,129)',
                                pointHighlightStroke: 'rgb(255,120,129)',
                                data: barTerminatedContracts
                            },
                        ]
                    }

                    // var areaChartOptions = {
                    // maintainAspectRatio : false,
                    // responsive : true,
                    // legend: {
                    //     display: false
                    // },
                    // scales: {
                    //     xAxes: [{
                    //     gridLines : {
                    //         display : false,
                    //     }
                    //     }],
                    //     yAxes: [{
                    //     gridLines : {
                    //         display : false,
                    //     }
                    //     }]
                    // }
                    // }

                    // This will get the first returned node in the jQuery collection.
                    // new Chart(areaChartCanvas, {
                    // type: 'line',
                    // data: barData,
                    // options: areaChartOptions
                    // })

                    //-------------
                    //- BAR CHART -
                    //-------------
                    // var barChartCanvas = $('#barChart').get(0).getContext('2d')
                    var barChartData = $.extend(true, {}, barData)
                    var temp0 = barData.datasets[0]
                    var temp1 = barData.datasets[1]
                    barChartData.datasets[0] = temp1
                    barChartData.datasets[1] = temp0

                    var barChartOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        datasetFill: false
                    }

                    new Chart(barChartCanvas, {
                        type: 'bar',
                        data: barChartData,
                        // data: barData,
                        options: barChartOptions
                    })

                    stopLoading();
                },
                error: function () {
                    toastr.error('Data gathering error!');
                    stopLoading();
                }
            })

            var labelAContracts = '';
            var labelEContracts = '';
            // var labelIContracts = '';
            var labelTContracts = '';

            console.log('sa baba', data.TerminatedContracts);

            data.ActiveContracts <= 1 ? $('#activeContracts').text('Active Contract') : $('#activeContracts').text('Active Contracts');
            data.ExpiringContracts <= 1 ? $('#expiringContracts').text('Expiring Contract') : $('#expiringContracts').text('Expiring Contracts');
            // data.InactiveContracts <= 1 ? $('#inactiveContracts').text('Inactive Contract') : $('#inactiveContracts').text('Inactive Contracts');
            data.TerminatedContracts <= 1 ? $('#terminatedContracts').text('Terminated Contract') : $('#terminatedContracts').text('Terminated Contracts');

            labelAContracts = data.ActiveContracts <= 1 ? 'Active Contract' : 'Active Contracts';
            labelEContracts = data.ExpiringContracts <= 1 ? 'Expiring Contract' : 'Expiring Contracts';
            // labelIContracts = data.InactiveContracts <= 1 ? 'Inactive Contract' : 'Inactive Contracts';
            labelTContracts = data.TerminatedContracts <= 1 ? 'Terminated Contract' : 'Terminated Contracts';



            $('.activeContracts').text(data.ActiveContracts);
            $('.expiringContracts').text(data.ExpiringContracts);
            // $('.inactiveContracts').text(data.InactiveContracts);
            $('.terminatedContracts').text(data.TerminatedContracts);

            //-------------
            //- DONUT CHART -
            //-------------
            // Get context with jQuery - using jQuery's .get() method.
            var donutChartCanvas = $('#donutChart').get(0).getContext('2d')
            var donutData = {
                labels: [
                    labelAContracts,
                    labelEContracts,
                    // labelIContracts,
                    labelTContracts
                ],
                datasets: [
                    {
                        data: [data.ActiveContracts, data.ExpiringContracts, data.TerminatedContracts],
                        backgroundColor: [
                            'rgb(130,218,92)',
                            'rgb(255,177,129)',
                            'rgb(255,120,129)'],
                    }
                ]
            }
            var donutOptions = {
                maintainAspectRatio: false,
                responsive: true,
            }
            //Create pie or douhnut chart
            // You can switch between pie and douhnut using the method below.
            new Chart(donutChartCanvas, {
                type: 'doughnut',
                data: donutData,
                options: donutOptions
            })
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}
//////////////////////////////////////////////////////////////////////////////////////////End: LOAD LDMS DASHBOARD DATA//////////////////////////////////////////////////////////////////////////////////////////
//START: LANDOWNER FLOAT VIEW MODAL
function viewLandownermodal(data, id, name) {
    showModal();
    ModalSize('xl');
    var title = 'View Landowner <b class="selectedid" data-id="' + id + '">' + name + '</b> ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    title += '<b></b>';
    if (Permission.includes(data + "_view") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' <em style="color:#088C08">(Read Only)</em>');
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
/**
 * Description: View Data for Landowner
 * 
 * @param {*} sourceContract 
 * @param {*} filter 
 */
function viewLandownerInfoData() {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/viewLandownerFloatingData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            FloatLOID: $('.selectedid').data('id'),
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (viewdata) {
            console.log('view data Landowner', viewdata);
            if (viewdata.FirstName == null) {
                var CompanyData = viewdata;
                $('#selectType').text('Company Information')
                $('.hideIndividual').hide()
                $('.hideCompany').show()
                $('.LandownerCode').text(CompanyData.LandownerCode);
                $('.LastName').text(CompanyData.LastName);
                $('.ContactNumber').text(CompanyData.ContactNumber);
                $('.Address').text(CompanyData.Address);
                $('.remarks').text(CompanyData.remarks);
            } else {
                var IndividualData = viewdata;
                $('#selectType').text('Individual Information')
                $('.hideIndividual').show()
                $('.hideCompany').hide()
                $('.LandownerCode').text(IndividualData.LandownerCode);
                $('.FirstName').text(IndividualData.FirstName);
                $('.MiddleName').text(IndividualData.MiddleName);
                $('.LastName').text(IndividualData.LastName);
                $('.Suffix').text(IndividualData.Suffix);
                $('.GenderName').text(IndividualData.GenderName);
                $('.BirthDate').text(IndividualData.BirthDate);
                $('.Nationality').text(IndividualData.Nationality);
                $('.CS_Name').text(IndividualData.CS_Name);
                $('.provinceName').text(IndividualData.provinceName);
                $('.cityName').text(IndividualData.cityName);
                $('.barangayName').text(IndividualData.barangayName);
                $('.Address').text(IndividualData.Address);
                $('.ContactNumber').text(IndividualData.ContactNumber);
                $('.Email').text(IndividualData.Email);
                $('.remarks').text(IndividualData.remarks);
            }
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}
//END: LANDOWNER FLOAT VIEW MODAL
//START: LANDOWNER INFORMATION FLOAT VIEW MODAL
function viewLandInfomodal(data, id, name) {
    console.log('modal LI data', data);
    console.log('modal LI id', id);
    console.log('modal LI name', name);
    showModal();
    ModalSize('xl');
    var title = 'View Land Information <b class="selectedid" data-id="' + id + '">' + name + '</b> ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    title += '<b></b>';
    if (Permission.includes(data + "_view") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' <em style="color:#088C08">(Read Only)</em>');
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
/**
 * Description: View Data for Landowner Information
 * 
 * @param {*} sourceContract 
 * @param {*} filter 
 */
function viewLandInformationData() {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/viewLandInfoFloatingData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            FloatLIID: $('.selectedid').data('id'),
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (viewdata) {
            console.log('view data Land Information', viewdata);
            var LandInformation = viewdata;

            // Set common properties
            $('.LandInformationCode').text(LandInformation.LandInformationCode);
            $('.FullName').text(LandInformation.Fullname);
            $('.Description').text(LandInformation.Description);
            $('.DocumentNumber').text(LandInformation.DocumentNumber);
            $('.LotNumber').text(LandInformation.LotNumber);
            $('.Area').text(LandInformation.Area);
            $('.provinceName').text(LandInformation.provinceName);
            $('.cityName').text(LandInformation.cityName);
            $('.barangayName').text(LandInformation.barangayName);

            // Handle CoOwner display
            $('.hideCoOwner').css('display', LandInformation.WithCoOwner ? 'block' : 'none');
            $('.CoOwner').text(LandInformation.CoOwner);

            // Handle Remarks display
            if (LandInformation.DocumentTypeCode === 4) {
                $('.hideRemarks').show();
                $('.remarks').text(LandInformation.remarks);
            } else {
                $('.hideRemarks').hide();
            }
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}
//END: LANDOWNER INFORMATION FLOAT VIEW MODAL


//Start: Payment Monitoring Dashboard


function getPaymentOverdue() {
    console.log('Permission', Permission, Permission.includes('LDMSDashboard_paymentsched'));
    var PaymentPermission = Permission.includes('LDMSDashboard_paymentsched');
    if (Permission.includes('LDMSDashboard_paymentsched') === true) {
        $('#LDMSDashboard_paymentsched').show();
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getDashboardPaymentMonitoring',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({
                username: $("#username").val(),
                token: $("#token").val(),
                sysapp: sysapp
            }),
            contentType: "application/json; charset=utf-8",
            success: function (data) {

                console.log(data);
                $('#forpayment').text(data.ForPayment);
                $('#overdue').text(data.Overdue);
            },
            error: function () {
                toastr.error('Data gathering error!');
                stopLoading();
            }

        })
    }
    else {
        $('#LDMSDashboard_paymentsched').hide();
    }

}

//End: Payment Monitoring Dashboard

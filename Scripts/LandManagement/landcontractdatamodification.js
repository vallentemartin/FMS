$('.HTML_container').ready(function () {
    initDataLandContract('ContractMain_Float');
    getSysAllLandContract('ContractMain_Float');
})
//START: DATA TABLE
/**
 * Description: This function initialize the data table set by ID.
 * 
 * @param {*} Data 
 */
function initDataLandContract(Data) {
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
 * @param {*} sourceLandContract 
 */
function getSysAllLandContract(sourceLandContract) {
    console.log('LAND CONTRACT TABLE', sourceLandContract);
    showdatatablesLoader(sourceLandContract);
    var headcol = $('#tbl_' + sourceLandContract + ' thead tr th');
    var colid = [];
    for (var x in headcol) {
        if (headcol[x].className != undefined) {
            var y = headcol[x].className.split(' ');
            colid.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getFloatLandContractDataByStatus',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceLandContract,
            isactive: $('.statusFilter').is(':checked'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('landowner data', data);
            var datarow = [];
            $('#tbl_' + sourceLandContract).DataTable().clear().draw();
            for (var i in data) {
                console.log('data table LO', data[i].LandownerCode);
                var dataarr = [];
                for (var j in colid) {
                    if (colid[j] == 'id') {
                        if (data[i].floatStatus == 1) {
                            console.log('land land land', data[i].LandContractCode);
                            dataarr.push('<div style="text-align:center">' +
                                '<button type="button" onclick="viewLandContractmodal(\'' + sourceLandContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button>' +
                                '<button type="button" onclick="updateLandContractmodal(\'' + sourceLandContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].floatStatus + '\',\'' + data[i].LandContractCode + '\')" class="btn btn-outline-info btn-xs" style="width: 80px; margin-left: 10px; margin-right: 10px;">Update</button>' +
                                '</div>');
                        } else {
                            dataarr.push('<div style="text-align:center"><button type="button" onclick="viewLandContractmodal(\'' + sourceLandContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button></div>');
                        }
                        // dataarr.push('<div style="text-align:center"><button type="button" onclick="updateLandownerData(\'' + sourceLandContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
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
            $('#tbl_' + sourceLandContract).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceLandContract);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceLandContract);
        }
    })
}
//START: LAND INFORMATION FLOAT VIEW MODAL
function viewLandContractmodal(data, id, name, status) {
    console.log('modal LC data', data);
    console.log('modal LC id', id);
    console.log('modal LC name', name);
    console.log('modal LC status', status);
    showModal();
    ModalSize('xl');
    var title = 'View Land Contract (<b class="selectedid" data-id="' + id + '" >' + name + '</b>) ';
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
function updateLandContractmodal(data, id, name, status, LandContractCode) {
    console.log('update modal float status', status);
    showModal();
    ModalSize('xl');
    var title = 'Update Land Contract <b class="selectedid" data-id="' + id + '">(' + name + ')</b> ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    title += '<b></b>';
    if (Permission.includes(data + "_update") || excempted.includes($("#username").val())) {
    } else {
        $('.modal-title').append(' -<b style="color:#C73644"> Read/Write</b>');
    }
    $.ajax({
        url: $('#tbl_' + data).data('editpage'),
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            getLandContractDataforUpdate( id, status, LandContractCode);
            $('.modal-body').html(htmlreturn);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
}
//PLANTATION DROPDOWN
function getOptDataForPlantation(plantationcode, plantationname) {
    var fields = $('.triggercontractplantationselect');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggercontractplantationselect')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggercontractplantationselect')[0].className.split(' ');
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];
            var RAWHTML = '<option disabled selected>-</option>';
            getOptDataForPlantationAppend(optSource, optId, optName, RAWHTML, plantationcode, plantationname);
        }
    }
}

function getOptDataForPlantationAppend(optSource, optId, optName, RAWHTML, plantationcode, plantationname) {
    var data = [];

    for (var i in plantations) {
        data.push({
            PlantationCode: plantations[i],
            PlantationName: plantations[i]
        });
    }
        var RAWHTML = '<option value="' + plantationcode + '">' + plantationname + '</option>'
    for (var j in data) {
        RAWHTML += '<option value="' + data[j].PlantationCode + '">' + data[j].PlantationName + '</option>';
    }
    $('.' + optSource + '.triggercontractplantationselect').html(RAWHTML);
}

function getLandContractDataforUpdate(id, status, LandContractCode) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getLandContractInfobyID',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            LandContractCode: LandContractCode,
            FloatID: id,
            floatStatus: status,
            username: $("#username").val(),
            token: $("#token").val(),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (viewData) {
            console.log('new contract data for update', viewData);
            var LandContractData = viewData;
            var LandownerCode = LandContractData.LandownerCode;
            var Fullname = LandContractData.Fullname;
            var PaymentTermCode = LandContractData.PaymentTermCode;
            var PaymentTerms = LandContractData.PaymentTerms;
            var plantationcode = LandContractData.PlantationCode;
            var plantationname = LandContractData.PlantationName;

            $('.LandContractCodeupdate').val(LandContractData.LandContractCode);
            $('.floatStatusupdate').val(LandContractData.floatStatus);

            //START: LEASE CONTRACTED AREA
            $('#remaining').val(LandContractData.availableArea);
            $('#Sqm').val(LandContractData.LandContractedArea);
            var hectares = LandContractData.LandContractedArea / 10000;
            $('#Hectares').val(hectares);
            //END: LEASE CONTRACTED AREA

            //START: CONTRACT PAYMENT FORM DATA VIEW FOR UPDATE
            $('#lease_period').val(LandContractData.LeasePeriod);
            $('#terms').val(LandContractData.LeaseTerm);
            $('.advance_payment').val(LandContractData.AdvancePayment);
            $('.start_of_payment').val(LandContractData.StartOfPayment);

            //END: CONTRACT PAYMENT FORM DATA VIEW FOR UPDATE

            $('.infoLandownerName').text(LandContractData.name);
            $('.infoContactNumber').text(LandContractData.ContactNumber);
            
            if (LandContractData.CoOwner === '') {
                $('.hideCoOwner').hide();
            } else {
                $('.hideCoOwner').show();
            }

            $('.infoAddress').text(LandContractData.Address);
            $('.infoLotNumber').text(LandContractData.LotNumber);
            $('.infoTotalArea').text(LandContractData.Area);
            $('.infoCompanyName').text(LandContractData.CompanyCode + ' - ' + LandContractData.Companyname);

            console.log('Fullname', LandContractData.Fullname);
            console.log('repname', LandContractData.RepresentativeName);

            if ( LandContractData.Fullname === LandContractData.RepresentativeName ) {
                $("#isRep").prop('checked', true);
                $('.RepName').prop('disabled', true);
                $('.RepContactNumber').prop('disabled', true);
                $('.RepEmail').prop('disabled', true);
            } else {
                $("#isRep").prop('checked', false);
                $('.RepName').prop('disabled', false);
                $('.RepContactNumber').prop('disabled', false);
                $('.RepEmail').prop('disabled', false);
            }

            $('.RepName').val(LandContractData.RepresentativeName);
            $('.RepContactNumber').val(LandContractData.RepresentativeContactNumber);
            $('.RepEmail').val(LandContractData.RepresentativeEmail);

            if (LandContractData.Status === 0) {
                $("#newcontract").prop('checked', true);
                $("#renewcontract").prop('disabled', true);
                $("#preterm").prop('disabled', true);
            } else if (LandContractData.Status === 3) {
                $("#newcontract").prop('disabled', true);
                $("#renewcontract").prop('checked', true);
                $("#preterm").prop('disabled', true);
            } else if (LandContractData.Status === 4) {
                $("#newcontract").prop('disabled', true);
                $("#renewcontract").prop('disabled', true);
                $("#preterm").prop('checked', true);
            }

            getOptDataForAddLandownerSelectionUpdate(LandownerCode, Fullname);
            getOptDataForAddPaymentTermsSelectionUpdate(PaymentTermCode,PaymentTerms);
            getOptDataForPlantation(plantationcode, plantationname);

            $.ajax({
                url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getSelectedContractInfoData',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    LandownerCode: LandownerCode,
                    username: $("#username").val(),
                    token: $("#token").val(),
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    console.log('Land Information Data Update', data);
                    if (data) {
                        // $('.viewLandInformationNC').select2();
                        // $('.viewLandInformationNC').html('');
                        var LTHTML = '<option value="'+ LandContractData.LandInformationCode +'" selected>'+ LandContractData.DocumentDescription + ' - (' + LandContractData.DocumentNumber + ')' +'</option>';
                        for (var i in data) {
                            LTHTML += '<option value="' + data[i].LandInformationCode + '">' + data[i]
                                .Description + ' - (' + data[i].DocumentNumber + ')' + '</option>';
                        }
                        $('.viewLandInformationNC').html(LTHTML);
                        // $('.viewLandInformationNC option[value="' + LandContractData.LandInformationCode + '"]').hide();
                        
                    } else {
                        toastr.error('Error fetching Land Information!');
                    }
                }
            })
        }
    })
}
/**
 * Description: This function triggers the select:option of data input.
 * 
 */
function getOptDataForAddLandownerSelectionUpdate(LandownerCode, Fullname) {
    var fields = $('.triggerlandownerselectionupdate');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggerlandownerselectionupdate')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggerlandownerselectionupdate')[0].className.split(' ');
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];
            var RAWHTML = '<option value="' + LandownerCode + '" disabled>' + Fullname + '</option>';
            getOptDataForAddLandownerUpdateAppend(optSource,optId,optName,RAWHTML);
        }
    }
}
/**
 * Description: This function fetch the data given by trigger.
 * 
 * @param {*} optSource 
 * @param {*} optId 
 * @param {*} optName 
 * @param {*} RAWHTML 
 */
function getOptDataForAddLandownerUpdateAppend(optSource,optId,optName,RAWHTML){
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
            console.log('landowner code daw', data);
            for (var i in data) {
                RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
            }
            $('.' + optSource + '.triggerlandownerselectionupdate').html(RAWHTML);
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}
/**
 * Description: This function triggers the select:option of data input.
 * 
 */
function getOptDataForAddPaymentTermsSelectionUpdate(PaymentTermCode, PaymentTerms) {
    console.log('payment term code', PaymentTermCode);
    console.log('pament term', PaymentTerms);
    var fields = $('.triggerpaymenttermselectionupdate');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggerpaymenttermselectionupdate')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggerpaymenttermselectionupdate')[0].className.split(' ');
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];
            getOptDataForAddPaymentTermsUpdateAppend(optSource,optId,optName,PaymentTermCode,PaymentTerms);
        }
    }
}
/**
 * Description: This function fetch the data given by trigger.
 * 
 * @param {*} optSource 
 * @param {*} optId 
 * @param {*} optName 
 * @param {*} RAWHTML 
 */
function getOptDataForAddPaymentTermsUpdateAppend(optSource,optId,optName,PaymentTermCode,PaymentTerms){
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
            console.log('payment terms daw', data);
            var selectedValue = PaymentTermCode;
            var RAWHTML = '<option value="' + PaymentTermCode + '" disabled>' + PaymentTerms + '</option>';
            for (var i in data) {
                var selected = data[i].id === selectedValue ? ' selected' : '';
                RAWHTML += '<option value="' + data[i].id + '"' + selected + '>' + data[i].name + '</option>';
            }
            $('.' + optSource + '.triggerpaymenttermselectionupdate').html(RAWHTML);
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}
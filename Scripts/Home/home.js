$('.HTML_container').ready(function () {
    initDataContractInfo('ContractMain');
    getSysAllContractInfoData('ContractMain');
})

$('.role').ready(function () {
    console.log(1,Permission);
    setTimeout(function() {
        loadHomeContent();
        console.log('load na');
    }, 1000);
    console.log(3,Permission);
    getLDMSDashboardData();
})
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
    // if (Permission.includes(Data + "_add") || excempted.includes($("#username").val())) {
    //     $('#tbl_' + Data + '_filter').append(' <button class="btn btn-outline-success btn-sm addData" onclick="addContractInfoData(\'' + Data + '\')"><i class="fas fa-plus"></i> Add</button>');
    // }
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
                    if (colid[j] == 'id') {
                        if ( Permission.includes('Contracts_LDMS') || excempted.includes($("#username").val())) {
                            dataarr.push('<div style="text-align:center">' +
                                '<button type="button" onclick="viewLandcontractData(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;" title="View"><i class="fas fa-eye"></i></button>' + 
                                '<button type="button" onclick="approvedContractmodal(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\')" class="btn btn-outline-success btn-xs" style="width: 80px; margin-left: 10px; margin-right: 10px;" title="Approve"><i class="far fa-thumbs-up"></i></button>' +
                                '<button type="button" onclick="returnedContractmodal(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\')" class="btn btn-outline-danger btn-xs" style="width: 80px;" title="Return"><i class="fas fa-undo"></i></buttons>' +
                                '</div>');
                        }
                    } else if (colid[j] == 'Status') {
                        switch (data[i].Status) {
                            case 0:
                                dataarr.push('<div style="text-align:center;background-color:#088C08"><b>Active</b></div>');
                                break;
                            case 1:
                                dataarr.push('<div style="text-align:center;color:#FF6308"><b>Expiring</b></div>');
                                break;
                            case 2:
                                dataarr.push('<div style="text-align:center;color:#FF0808"><b>Expired</b></div>');
                                break;
                            case 3:
                                dataarr.push('<div style="text-align:center;color:#72918E"><b>Renewed</b></div>');
                                break;
                            case 4:
                                dataarr.push('<div style="text-align:center;color:#68233D"><b>Pre-Term</b></div>');
                                break;
                            case 5:
                                dataarr.push('<div style="text-align:center;color:#080808"><b>Terminated</b></div>');
                                break;
                            case 6:
                                dataarr.push('<div style="text-align:center;color:#077A88"><b>Pending</b></div>');
                                break;
                            case 7:
                                dataarr.push('<div style="text-align:center;color:#A5C18A"><b>Returned</b></div>');
                                break;
                            default:
                                dataarr.push('<div style="text-align:center;color:#A5C18A"><b>Error Status</b></div>');
                                break;
                        }                        
                    } else if (colid[j] == 'geoLocation') {
                        //dataarr.push('<div style="text-align:center"><a href="https://www.google.com/maps/place/' + data[i][colid[j]] + '" target="_blank">' + data[i][colid[j]] + '</a></div>');
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
function approvedContractmodal(sourceContract, id, name) {
    console.log('modal sourcedata', sourceContract);
    console.log('modal id', id);
    console.log('modal name', name);

    showModal();
    ModalSize('m');
    var title = 'Approve Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="approveRemarks(\'' + sourceContract + '\',\'' + id + '\')"> Save' + '</button >';
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
function approveRemarks(sourceContract, id) {
    var status = 0;

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/updatePendingContracts',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceContract,
            sysapp: sysapp,
            Status: status,
            LandContractCode: id,
            approvedRemarks: $('#approveRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('approved',data);
            hideModal();
            getSysAllContractInfoData(sourceContract);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
function returnedContractmodal(sourceContract, id, name) {
    console.log('modal sourcedata', sourceContract);
    console.log('modal id', id);
    console.log('modal name', name);

    showModal();
    ModalSize('m');
    var title = 'Return Remarks';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >' + 
                 '<button type="button" class="btn btn-success" onclick="returnRemarks(\'' + sourceContract + '\',\'' + id + '\')"> Save' + '</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: $('#tbl_' + sourceContract).data('returnpage'),
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
function returnRemarks(sourceContract, id) {
    var status = 7;

    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/updatePendingContracts',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: sourceContract,
            sysapp: sysapp,
            Status: status,
            LandContractCode: id,
            approvedRemarks: $('#returnRemarks').val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('return',data);
            hideModal();
            getSysAllContractInfoData(sourceContract);
        },
        error: function () {
            toastr.error('Error on updating data!');
            stopLoading();
        }
    })
}
function viewLandcontractData(data, id, name, status) {
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
        $('.modal-title').append(' <em>(Read Only)</em>');
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
function loadHomeContent(){
    var section = '';
    // var LDMSheader = '';
    var LDMSREPORT = Permission.includes('LDMSDashboard_role'); // if role exsist
    section = LDMSREPORT === true ? $('#LDMSDashboard_role').show() : $('#LDMSDashboard_role').hide(); // hide/show role
    // LDMSheader = $('#LDMSchartbutton').data().card('widget') == 'collapse' ? $('hideLDMSheader').show() : $('hideLDMSheader').hide()
    console.log(2,Permission);
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
                    var barPlantationCode = [];
                    var barActiveContracts = [];
                    var barExpiringContracts = [];
                    var barInactiveContracts = [];

                    for (var j in data) {
                        barPlantationCode.push(data[j].PlantationCode);
                        barActiveContracts.push(data[j].ActiveContracts);
                        barExpiringContracts.push(data[j].ExpiringContracts);
                        barInactiveContracts.push(data[j].InactiveContracts);
                    }

                    // Get context with jQuery - using jQuery's .get() method.
                    var barChartCanvas = $('#barChart').get(0).getContext('2d')
                    var barData = {
                    labels  : barPlantationCode,
                    datasets: [
                        {
                        label               : 'Expiring',
                        backgroundColor     : 'rgb(255,177,129)',
                        borderColor         : 'rgb(255,177,129)',
                        pointRadius          : false,
                        pointColor          : '#FFFF93',
                        pointStrokeColor    : '#FFFF93',
                        pointHighlightFill  : 'rgb(255,177,129)',
                        pointHighlightStroke: 'rgb(255,177,129)',
                        data                : barExpiringContracts
                        },
                        {
                        label               : 'Active',
                        backgroundColor     : 'rgb(130,218,92)',
                        borderColor         : 'rgb(130,218,92)',
                        pointRadius         : false,
                        pointColor          : 'rgb(130,218,92)',
                        pointStrokeColor    : 'rgb(130,218,92)',
                        pointHighlightFill  : 'rgb(130,218,92)',
                        pointHighlightStroke: 'rgb(130,218,92)',
                        data                : barActiveContracts
                        },
                        {
                        label               : 'Inactive',
                        backgroundColor     : 'rgb(255,120,129)',
                        borderColor         : 'rgb(255,120,129)',
                        pointRadius         : false,
                        pointColor          : 'rgb(255,120,129)',
                        pointStrokeColor    : 'rgb(255,120,129)',
                        pointHighlightFill  : 'rgb(255,120,129)',
                        pointHighlightStroke: 'rgb(255,120,129)',
                        data                : barInactiveContracts
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
                    responsive              : true,
                    maintainAspectRatio     : false,
                    datasetFill             : false
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
            var labelIContracts = '';

            data.ActiveContracts <= 1 ? $('#activeContracts').text('Active Contract') : $('#activeContracts').text('Active Contracts');
            data.ExpiringContracts <= 1 ? $('#expiringContracts').text('Expiring Contract') : $('#expiringContracts').text('Expiring Contracts');
            data.InactiveContracts <= 1 ? $('#inactiveContracts').text('Inactive Contract') : $('#inactiveContracts').text('Inactive Contracts');

            labelAContracts = data.ActiveContracts <= 1 ? 'Active Contract' : 'Active Contracts';
            labelEContracts = data.ExpiringContracts <= 1 ? 'Expiring Contract' : 'Expiring Contracts';
            labelIContracts = data.InactiveContracts <= 1 ? 'Inactive Contract' : 'Inactive Contracts';



            $('.activeContracts').text(data.ActiveContracts);
            $('.expiringContracts').text(data.ExpiringContracts);
            $('.inactiveContracts').text(data.InactiveContracts);

            //-------------
            //- DONUT CHART -
            //-------------
            // Get context with jQuery - using jQuery's .get() method.
            var donutChartCanvas = $('#donutChart').get(0).getContext('2d')
            var donutData        = {
            labels: [
                labelAContracts,
                labelEContracts,
                labelIContracts,
            ],
            datasets: [
                {
                data: [data.ActiveContracts,data.ExpiringContracts,data.InactiveContracts],
                backgroundColor : [
                    'rgb(130,218,92)',
                    'rgb(255,177,129)',
                    'rgb(255,120,129)'],
                }
            ]
            }
            var donutOptions     = {
            maintainAspectRatio : false,
            responsive : true,
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
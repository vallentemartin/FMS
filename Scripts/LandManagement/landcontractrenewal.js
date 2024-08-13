$('.HTML_container').ready(function () {
    initDataContractInfo('ContractMain');
    getSysAllContractInfoData('ContractMain');
})
// START: LANDOWNER FUNCTIONS
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
            'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllContractInfoData(\'' + Data + '\')" title="Reload Table"><i class="fas fa-redo-alt"></i> Reload</button>';
        $('#tbl_' + Data + '_filter').prepend(htmlFilter);
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
    if (Permission.includes(Data + "_add") || excempted.includes($("#username").val())) {
        $('#tbl_' + Data + '_filter').append(' <button class="btn btn-outline-success btn-sm addData" onclick="addContractInfoData(\'' + Data + '\')"><i class="fas fa-plus"></i> Add</button>');
    }
}
//UPDATE LANDOWNER
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
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getcontractRenewal',
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
                        if (data[i].Status === 1) {
                            dataarr.push(
                                '<div style="text-align:center">' + 
                                '<button type="button" onclick="viewLandcontractForRenewalData(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button>' + 
                                '<button type="button" onclick="updateExpiringLandContractData(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 80px; margin-left: 10px; margin-right: 10px;" id="updateButton">Update</button>' + 
                                '</div>');
                        } else {
                            dataarr.push('<div style="text-align:center"><button type="button" onclick="viewLandcontractForRenewalData(\'' + sourceContract + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-primary btn-xs" style="width: 80px;">View</button></div>');
                        }
                    } else if (colid[j] == 'Status') {
                        switch (data[i].Status) {
                            case 0:
                                dataarr.push('<div style="text-align:center;color:#088C08"><b>Active</b></div>');
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
                            // case 7:
                            //     dataarr.push('<div style="text-align:center;color:#A5C18A"><b>Returned</b></div>');
                            //     break;
                            default:
                                dataarr.push('<div style="text-align:center;color:#A5C18A"><b>Error Status</b></div>');
                                break;
                        }   
                    } else if (colid[j] == 'isactive') {
                        if (data[i][colid[j]]) {
                            dataarr.push('<div style="text-align:center;color:green"><b>Enabled</b></div>');
                        } else {
                            dataarr.push('<div style="text-align:center;color:red"><b>Disabled</b></div>');
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
$('.HTML_container').ready(function () {
    // initDataTables('Payee');
    
   var Data = 'Payee';
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
        lengthMenu: [
            [10, 25, 50, 100],
            ['10 rows', '25 rows', '50 rows', '100 rows']
        ],
        buttons: [
            "pageLength",
            "colvis",
            {
                extend: 'excelHtml5',
                title: Data + ' Export'
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
            'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllData(\'' + Data + '\')" title="Reload Table"><i class="fas fa-redo-alt"></i> Reload</button>';
        $('#tbl_' + Data + '_filter').prepend(htmlFilter);
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
    if (Permission.includes(Data + "_add") || excempted.includes($("#username").val())) {
        $('#tbl_' + Data + '_filter').append(' <button class="btn btn-outline-success btn-sm addDataPayee" onclick="addDataPayee(\'' + Data + '\')"><i class="fas fa-plus"></i> Add </button>');
    }
     getSysAllData('Payee');
})

function addDataPayee(data) {
    showModal();
    ModalSize('xl');
    var title = 'Add ' + data;
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    if (data != 'SysUsers') {
        $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="getPayeeExist(\'' + data + '\')"> Add ' + data + '</button >');
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
function getPayeeExist(dataSource) {
    var fields = $('.triggerdetail');
    var fieldID = [];
    var inputData = {};
    var inputDataCollection = {};
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    if (confirm('Save this data?')) {
        inputDataCollection['username'] = $("#username").val();
        inputDataCollection['token'] = $("#token").val();
        inputDataCollection['dataSource'] = dataSource;
        inputDataCollection['sysapp'] = sysapp;
        inputDataCollection['FirstName'] = $('.triggerdetail.FirstName').val();
        inputDataCollection['LastName'] = $('.triggerdetail.LastName').val();
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/getPayeeExist',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(inputDataCollection),
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data[0].result == 0) {
                    saveNewPayee(dataSource);
                } else {
                    toastr.error('Payee Already Exist');
                    stopLoading();
                }
            },
            error: function () {
                toastr.error('Error on saving data!');
                stopLoading();
            }
        })
    }
}

function saveNewPayee(dataSource) {
    var fields = $('.triggerdetail');
    var fieldID = [];
    var inputData = {};
    var inputDataCollection = {};
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
        inputDataCollection['username'] = $("#username").val();
        inputDataCollection['token'] = $("#token").val();
        inputDataCollection['dataSource'] = dataSource;
        inputDataCollection['sysapp'] = sysapp;
        for (var j in fieldID) {
            inputData[fieldID[j]] = $('.triggerdetail.' + fieldID[j]).val();
            $('.triggerdetail.' + fieldID[j]).val('');
        }
        inputDataCollection['inputData'] = inputData;
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/saveSysData',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(inputDataCollection),
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data.retval == 1) {
                    getSysAllData(dataSource);
                    toastr.success('Data added!');
                } else {
                    toastr.error('Duplicate code!');
                    stopLoading();
                }
            },
            error: function () {
                toastr.error('Error on saving data!');
                stopLoading();
            }
        })
}


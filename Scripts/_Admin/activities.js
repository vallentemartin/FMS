$('.HTML_container').ready(function () {
    $('#tbl_Logs').DataTable({
        language: {
            sSearch: "",
            searchPlaceholder: "Search records"
        },
        order: [[3, 'desc']],
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
                title: 'System Activity Logs'
            }
        ]
    }).buttons().container().appendTo('#tbl_Logs_wrapper .col-md-6:eq(0)');
    $('#tbl_Logs_paginate').css('font-size', 'smaller').css('float', 'right');
    $('#tbl_Logs_filter').css('float', 'right');
    $('#logsdatetimerange').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('second').add(-24, 'hour'), 
        endDate: moment().startOf('second'),
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY HH:mm'
        }
    })
    loadLogs('Logs');
})

function loadLogs(dataSource) {
    var daterange = $('#logsdatetimerange').val().split(" - ");
    var mindate = daterange[0];
    var maxdate = daterange[1];
    var count;
    if ($('#getDataTop').val() == null) {
        count = 0;
    } else {
        count = $('#getDataTop').val();
    }
    startLoading();
    var headcol = $('#tbl_' + dataSource + ' thead tr th');
    var colid = [];
    for (var x in headcol) {
        if (headcol[x].className != undefined) {
            var y = headcol[x].className.split(' ');
            colid.push(y[0]);
        }
    }
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysLogs',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            count: count,
            mindate: mindate,
            maxdate: maxdate,
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var RAWHTML = '';
            $('#tbl_' + dataSource).DataTable().clear().draw();
            for (var i in data) {
                var activitydet = data[i].activity.split(" | ");
                var jsontext;
                if (activitydet[0] == "Logout") {
                    jsontext = "";
                } else {
                    jsontext = activitydet[1];
                }
                RAWHTML += '<tr>';
                for (var j in colid) {
                    if (colid[j] == 'logId') {
                        RAWHTML += '<td style="text-align:center"><button type="button" onclick="showJSON(' + data[i][colid[j]] +')" class="btn btn-outline-info btn-xs">View JSON</button><div hidden class="' + data[i][colid[j]] +'">' + jsontext + '</div></td>';
                    } else if (colid[j] == 'activity') {
                        RAWHTML += '<td style="text-align:center">' + activitydet[0] + '</td>';
                    } else {
                        RAWHTML += '<td style="text-align:center">' + data[i][colid[j]] + '</td>';
                    }
                }
                RAWHTML += '</tr>';
                $('#tbl_' + dataSource).DataTable().row.add($(RAWHTML).get(i)).draw();
            }
            stopLoading();
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            stopLoading();
        }
    })
}
function showJSON(JSONID) {
    showModal();
    ModalSize('xl');
    var title = 'View JSON';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    $('.modal-title').html(title);
    $('.modal-body').html("<textarea class='form-control' rows='17'>"+$('.' + JSONID).html()+"</textarea>");
}

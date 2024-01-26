$('.HTML_container').ready(function () {
    initDataTables('Calendar');
    var htmlFilter = '<input hidden type="checkbox" class="statusFilter statusFilterCalendar" checked>' +
                     '<button class="btn btn-info btn-sm" onclick="GenerateCalendar()" title="Generate Calendar"><i class="fas fa-plus"></i> Generate</button>';
    $('#tbl_Calendar_filter').prepend(htmlFilter);
    getSysAllData('Calendar');

    initDataTables('Period');
    var htmlFilter = '<input hidden type="checkbox" class="statusFilter statusFilterPeriod" checked>';
    $('#tbl_Period_filter').prepend(htmlFilter);
    getSysAllData('Period');
})

function GenerateCalendar() {
    showModal();
    ModalSize('sm');
    var title = 'Add/Generate Calendar';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="GenerateDate()"> Generate</button >');
    $('.modal-title').html(title);
    $.ajax({
        url: 'pages/masterdata/modalpages/calendar_generate',
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
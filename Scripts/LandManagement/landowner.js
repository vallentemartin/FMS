$('.HTML_container').ready(function () {
    initDataLandowner('Landowner');
    getSysAllLandownerData('Landowner');
})
// START: LANDOWNER FUNCTIONS
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
        var htmlFilter = ' <datatablefilterbox><input type="checkbox" class="statusFilter statusFilter' + Data + '"' +
            'checked ' +
            'data-bootstrap-switch ' +
            'data-off-color="danger" ' +
            'data-on-color="success" ' +
            'data-on-text="Enabled" ' +
            'data-off-text="Disabled"></datatablefilterbox> <button class="btn btn-info btn-sm" onclick="getSysAllLandownerData(\'' + Data + '\')" title="Reload Table"><i class="fas fa-redo-alt"></i> Reload</button>';
        $('#tbl_' + Data + '_filter').prepend(htmlFilter);
        $("input[data-bootstrap-switch]").each(function () {
            $(this).bootstrapSwitch('state', $(this).prop('checked'));
        })
    }
    if (Permission.includes(Data + "_add") || excempted.includes($("#username").val())) {
        $('#tbl_' + Data + '_filter').append(' <button class="btn btn-outline-success btn-sm addData" onclick="addLandownerData(\'' + Data + '\')"><i class="fas fa-plus"></i> Add</button>');
    }
}
/**
 * Description: To add data of the specific table.
 * 
 * @param {*} data 
 */
function addLandownerData(data) {
    showModal();
    ModalSize('xl');
    var title = 'Create ' + data;
    // var title = 'Add ' + data;
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    if (data != 'SysUsers') {
        $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="saveLandownerData(\'' + data + '\')"> Save ' + data + '</button >');
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
/**
 * Description:
 * This function save the data of the specific table.
 * 
 * @param {*} sourceLandowner 
 */
function saveLandownerData(sourceLandowner) {
    var fields = $('.triggerlandowner');
    var fieldID = [];
    var inputDataIndividual = {};
    var inputDataCollection = {};
    var inputDataCompany = {};
    var lastname = '';
    var remarks = '';
    var address = '';

    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }

    lastname = $('#idvllastname').val() == '' ? $('#companylastname').val() : $('#idvllastname').val();
    address = $('#idvladdress').val() == '' ? $('#companyaddress').val() : $('#idvladdress').val();
    remarks = $('#idvlremarks').val() == '' ? $('#companyremarks').val() : $('#idvlremarks').val();

    if (confirm('Save Landowner data?')) {
        console.log('save lastname',lastname);
        inputDataCollection['username'] = $("#username").val();
        inputDataCollection['token'] = $("#token").val();
        inputDataCollection['dataSource'] = sourceLandowner + '_Float';
        inputDataCollection['sysapp'] = sysapp;
        inputDataIndividual['LastName'] = lastname;
        inputDataIndividual['ContactNumber'] = '+' + $('#idvlcontactnumber').val();
        inputDataIndividual['remarks'] = remarks;
        inputDataIndividual['cityCode'] = $('.cityCode').val();
        inputDataIndividual['barangayCode'] = $('.barangayCode').val();
        inputDataCompany['LastName'] = lastname;
        inputDataCompany['ContactNumber'] = '+' + $('#companynumber').val();
        inputDataCompany['Address'] = address;
        inputDataCompany['remarks'] = remarks;
        for (var j in fieldID) {
            inputDataIndividual[fieldID[j]] = $('.triggerlandowner.' + fieldID[j]).val();
            $('.triggerlandowner.' + fieldID[j]).val('');
        }
        inputDataCollection['inputData'] = $('input[name=ownertypeRadio]:checked', '#selectownertype').val() == 'individual' ? inputDataIndividual : inputDataCompany;
        console.log('Landowner Data',inputDataCollection);
        
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'FMSmain/saveLDMSData',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(inputDataCollection),
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                console.log(data);
                if (data.retval == 1) {
                    getSysAllLandownerData(sourceLandowner);
                    // toastr.success('Data added!');
                    toastr.info('Data added for approval!');
                    clearSelection('.GenderCode, .CivilStatusCode, .provinceCode, .cityCode, .barangayCode');
                    $('.LastName, .ContactNumber, .Address, .remarks, .FirstName, .MiddleName, .Suffix, .BirthDate, .Nationality, .Email').val('');
                    hideModal();
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
}
function clearSelection(e) {
    $(e).select2('destroy').val('').select2();
}
/**
 * Description: This function triggers the select:option of data input.
 * 
 */
function getOptDataForAddLandowner() {
    var fields = $('.triggerlandowner');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggerlandowner')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggerlandowner')[0].className.split(' ');
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];

            if ( fieldID[j].length == 11 ) {
                getOptDataForAddAppendCountry(optSource,optId,optName,RAWHTML);
            } else {
                var RAWHTML = '<option disabled selected>-</option>';
                getOptDataForAddLandownerAppend(optSource,optId,optName,RAWHTML);
            }
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
function getOptDataForAddLandownerAppend(optSource,optId,optName,RAWHTML){
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
            $('.' + optSource + '.triggerlandowner').html(RAWHTML);
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}

//UPDATE LANDOWNER
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
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSysAllData',
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
            var datarow = [];
            $('#tbl_' + sourceLandowner).DataTable().clear().draw();
            for (var i in data) {
                console.log('landowner data', data);
                console.log('landowner colid', colid);
                var dataarr = [];
                for (var j in colid) {
                    if (colid[j] == 'id') {
                        dataarr.push('<div style="text-align:center"><button type="button" onclick="updateLandownerData(\'' + sourceLandowner + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
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
            $('#tbl_' + sourceLandowner).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(sourceLandowner);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(sourceLandowner);
        }
    })
}

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
/**
 * Description: This function fetch the data for update view.
 * 
 * @param {*} sourceLandowner 
 * @param {*} filter 
 */
//DATA CRUD start
function getSysLandownerData(sourceLandowner, filter) {
    
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
            // data.BirthDate = moment(data.BirthDate).format('MM/DD/YYYY');
            // console.log('Birthday', $('.BirthDate').val(data.BirthDate));
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
                    getOptDataForLandownerUpdate(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
                } else {
                    $('.' + fieldID[j]).val(data[fieldID[j]]);
                }
            }
            if (Permission.includes(sourceLandowner + "_update") || excempted.includes($("#username").val())) {
                if ($('.status').data('status') == 0) {
                    $('.triggerlandowner').prop('disabled', 'true');
                }
            } else {
                $('.triggerlandowner').prop('disabled', 'true');
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
function getOptDataForLandownerUpdate(sourceLandowner, filter, id, name, selected) {
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
// END: LANDOWNER FUNCTIONS
//START: SET COUNTRY SELECTION DEFAULT: PHILIPPINES
/**
 * Description: This is to set the default value of Country Selection into Philippines.
 * 
 * @param {*} optSource 
 * @param {*} optId 
 * @param {*} optName 
 * @param {*} RAWHTML 
 */
function getOptDataForAddAppendCountry(optSource,optId,optName,RAWHTML){
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
            // console.log('data', data);
            var RAWHTML = '<option value="' + data[174].id + '">' + data[174].name + '</option>';
            for (var i in data) {
                RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
            }
            $('.' + optSource + '.triggerlandowner').html(RAWHTML);
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}
//END: SET COUNTRY SELECTION DEFAULT: PHILIPPINES
function hidedatatablesLoader(addTo) {
    $('.dtloader.' + addTo).remove();
}

function clearSelection(e) {
    $(e).select2('destroy').val('').select2();
}

$(function () {
    $.validator.setDefaults({
      submitHandler: function () {
        // alert( "Form successful submitted!" );
      }
    });
    $('#landownerForm').validate({
      rules: {
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
          minlength: 5
        },
        terms: {
          required: true
        },
      },
      messages: {
        email: {
          required: "Please enter a email address",
          email: "Please enter a vaild email address"
        },
        password: {
          required: "Please provide a password",
          minlength: "Your password must be at least 5 characters long"
        },
        terms: "Please accept our terms"
      },
      errorElement: 'span',
      errorPlacement: function (error, element) {
        error.addClass('invalid-feedback');
        element.closest('.form-group').append(error);
      },
      highlight: function (element, errorClass, validClass) {
        $(element).addClass('is-invalid');
      },
      unhighlight: function (element, errorClass, validClass) {
        $(element).removeClass('is-invalid');
      }
    });
  });
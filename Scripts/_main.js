function startLoading() {
    $('.overlay').removeClass('invisible');
    $('.overlay').addClass('visible');
}
function stopLoading() {
    $('.overlay').removeClass('visible');
    $('.overlay').addClass('invisible');
}
function startContentLoading(container) {
    $('.'+container).append('<div class="overlay ' + this + '"><i class="fas fa-2x fa-sync fa-spin"></i> </div> ');
}
function stopContentLoading() {
    $(this).remove();
}
function checkIfhasinputs(password, username) {
    if (password == '') {
        return false;
    }
    if (username == '') {
        return false;
    }
    return true
}
function loginToPage() {
    if (checkIfhasinputs($("#usrPassword").val(), $("#usrUsername").val())) {
        startLoading();
        var isdomainlogin = false;
        if ($("#isdomainlogin").is(":checked")) {
            isdomainlogin = true
        }
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'UserFunctions/login',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({
                isdomainlogin: isdomainlogin,
                username: $("#usrUsername").val(),
                password: $("#usrPassword").val(),
                ipadd: $("#ipadd").data('ipadd'),
                pform: $("#ipadd").data('pform'),
                application: sysapp,
            }),
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data.errorCode == 0) {
                    $.ajax({
                        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'UserFunctions/getEmpIDNo',
                        type: 'post',
                        dataType: 'json',
                        data: JSON.stringify({
                            username: $("#usrUsername").val(),
                            token: data.logintoken,
                            appid: sysapp
                        }),
                        contentType: "application/json; charset=utf-8",
                        success: function (retdata) {
                            $.ajax({
                                url: 'Pages/_Support_Page/login.cshtml',
                                type: 'post',
                                dataType: 'html',
                                data: {
                                    username: $("#usrUsername").val(),
                                    loginToken: data.logintoken,
                                    empid: retdata.empid,
                                    useremail: retdata.useremail,
                                    pageTheme: retdata.pageTheme,
                                    isdomainlogin: isdomainlogin
                                },
                                success: function () {
                                    location.reload();
                                },
                                error: function () {
                                    toastr.error('Login Error!');
                                    stopLoading();
                                }
                            })
                        }
                    })
                } else if (data.errorCode == 1) {
                    toastr.error(data.errorMessage);
                    $("#usrPassword").val('');
                    stopLoading();
                }
            },
            error: function () {
                toastr.error('API Auth Error!');
                stopLoading();
            }
        })
    } else {
        toastr.info('Username or Password inputs are empty!');
        stopLoading();
    }
}
function logoutToPage() {
    startLoading();
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'UserFunctions/logout',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            application: sysapp,
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            $.ajax({
                url: 'Pages/_Support_Page/logout.cshtml',
                type: 'post',
                dataType: 'html',
                success: function () {
                    location.reload();
                },
                error: function () {
                    toastr.error('Login Error!');
                    stopLoading();
                }
            })
        },
        error: function () {
            toastr.error('API Auth Error!');
            stopLoading();
        }
    })
}
function confirmToLogout() {
    showModal();
    ModalSize('xs');
    var title = 'Confirmation';
    var body = 'Logout to the System?';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > No</button >' +
        '<button type="button" class="btn btn-primary" onclick="logoutToPage()" data-dismiss="modal" >Yes</button>';
    $('.modal-body').html(body);
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
}
function confirmReload() {
    showModal();
    ModalSize('xs');
    var title = 'Confirmation';
    var body = 'Reload <b>' + $('#reloadpage').data('routepage') + '</b> page?';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > No</button >' +
        '<button type="button" class="btn btn-primary" onclick="execreloadpage(\'' + $('#reloadpage').data('routepage') + '\')" data-dismiss="modal" >Yes</button>';
    $('.modal-title').html(title);
    $('.modal-body').html(body);
    $('.modal-footer').html(footer);
}
function execreloadpage(routepage) {
    routePagebyBC(routepage)
}
function routePagebyBC(bc) {
    startLoading();
    $.ajax({
        url: 'Pages/_Support_Page/checkSession',
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.HTML_container').append(htmlreturn);
            if (bc != 'Home') {
                $.ajax({
                    url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getRoutesbyBreadcrumb',
                    type: 'post',
                    dataType: 'json',
                    data: JSON.stringify({
                        username: $("#username").val(),
                        breadcrumb: bc,
                        token: $("#token").val(),
                        sysapp: sysapp
                    }),
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        $.ajax({
                            url: data.route_fileLoc,
                            type: 'post',
                            dataType: 'html',
                            success: function (htmlreturn) {
                                var breadcrumb = data.breadcrumb.split('/');
                                var breadcrumbs = '';
                                for (var i = 0; i < breadcrumb.length; i++) {
                                    if (breadcrumb.length - 1 == i) {
                                        breadcrumbs += '<li class="breadcrumb-item active">' + breadcrumb[i] + '</li>'
                                    } else {
                                        breadcrumbs += '<li class="breadcrumb-item"><a href="javascript:;" class="breadcrumblink" data-route_name="' + breadcrumb[i] + '">' + breadcrumb[i] + '</a></li>'
                                    }
                                }
                                $('.pagelink').removeClass('active');
                                $('.' + data.route_code).addClass('active');
                                var title = data.route_name;
                                $('.pageTitle').html(title);
                                $('.HTML_container').html(htmlreturn);
                                $('.breadcrumb').html(breadcrumbs);
                                stopLoading();
                            },
                            error: function () {
                                toastr.error('Error on creating bread crumb/s');
                                stopLoading();
                            }
                        })
                    },
                    error: function () {
                        toastr.error('Error on ' + bc + ' Page!');
                        stopLoading();
                    }
                })
            } else {
                $.ajax({
                    url: 'Pages/Home/default.cshtml',
                    type: 'post',
                    dataType: 'html',
                    success: function (htmlreturn) {
                        var title = 'Home';
                        $('.pageTitle').html(title);
                        $('.HTML_container').html(htmlreturn);
                        $('.breadcrumb').html('<li class="breadcrumb-item active">Home</li>');
                        stopLoading();
                    },
                    error: function () {
                        toastr.error('Error on Home Page!');
                        stopLoading();
                    }
                })
            }
        },
        error: function () {
            toastr.error('Error on route link!');
            stopLoading();
        }
    })
}
function apiURL(name) {
    if (location.origin == "https://farm.lapanday.net") {
        if (name == 'c2673537-85cf-4a28-9cbc-5dad26d9c4a9') {
            return "https://lfcapi.lapanday.net/api/"
        } else if (name == 'f4a42ecb-6c84-4092-a8ca-8d639600ab75') {
            return "http://sample.accumatica.com/api/"
        } else if (name == '9deccf33-8b20-4323-b457-c75fa8beea64') {
            return "http://fms.lapanday.com/api/"
        }
    } else if (location.origin == "http://farm.lapanday.com") {
        if (name == 'c2673537-85cf-4a28-9cbc-5dad26d9c4a9') {
            return "http://lfcapi.lapanday.com:1263/api/"
        } else if (name == 'f4a42ecb-6c84-4092-a8ca-8d639600ab75') {
            return "http://sample.accumatica.com/api/"
        } else if (name == '9deccf33-8b20-4323-b457-c75fa8beea64') {
            return "http://fms.lapanday.com/api/"
        }
    } else if (location.origin == "http://localhost:62118") {
        if (name == 'c2673537-85cf-4a28-9cbc-5dad26d9c4a9') {
            return "http://localhost:1996/api/"
        } else if (name == 'f4a42ecb-6c84-4092-a8ca-8d639600ab75') {
            return "http://localhost:123/api/"
        } else if (name == '9deccf33-8b20-4323-b457-c75fa8beea64') {
            return "http://fms.lapanday.com/api/"
        }
    }
}
function disableF5(e) {
    if ($('#username').val() != undefined) {
        if ((e.which || e.keyCode) == 116) {
            confirmReload();
            e.preventDefault();
        }
    }
};
function checkUserToken() {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'helper/checkUserToken',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val()
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if (data) {
                //console.log(data,' @HttpContext.Current.Session["loginToken"]');
            } else {
                clearInterval(checkUserTokenInterval);
                alert('Session Expired!');
                logoutToPage();
            }
        },
        error: function () {
            toastr.error('Error Token Checking!');
            stopLoading();
        }
    })
}
function viewLoginUser() {
    showModal();
    ModalSize('xl');
    var title = '<b>' + $("#username").val() + '</b> Details';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: '/Pages/_UserPage/ModalPages/user_update',
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
function getSysData(dataSource, filter) {
    startLoading();
    var fields = $('.triggerdetail');
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
            dataSource: dataSource,
            filter: filter,
            selectedID: $('.selectedid').data('id'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            for (var j in fieldID) {
                if ($('.' + fieldID[j] + '.triggerdetail')[0].tagName == 'SELECT') {
                    var tagClasses = $('.' + fieldID[j] + '.triggerdetail')[0].className.split(' ');
                    var optSource = tagClasses[2];
                    var optFilter = optSource + 'Code';
                    var name = tagClasses[1];
                    getOptDataForUpdate(optSource, optFilter, fieldID[j], name, data[fieldID[j]]);
                } else {
                    $('.' + fieldID[j]).val(data[fieldID[j]]);
                }
            }
            if (Permission.includes(dataSource + "_update") || excempted.includes($("#username").val())) {
                if ($('.status').data('status') == 0) {
                    $('.triggerdetail').prop('disabled', 'true');
                }
            } else {
                $('.triggerdetail').prop('disabled', 'true');
            }
            stopLoading();
        },
        error: function () {
            toastr.error('Data gathering error!');
            stopLoading();
        }
    })
}
function updateData(data, id, name, status) {
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
function addData(data) {
    showModal();
    ModalSize('xl');
    var title = 'Add ' + data;
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    if (data != 'SysUsers') {
        $('.modal-footer').append('<button type="button" class="btn btn-success" onclick="saveNewData(\'' + data + '\')"> Add ' + data + '</button >');
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
function saveNewData(dataSource) {
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
}
function enabledisabledata(data) {
    if (confirm('Change status of this data?')) {
        var id = $('.selectedid').data('id');
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/EnableDisableData',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({
                username: $("#username").val(),
                token: $("#token").val(),
                dataSource: data,
                id: id,
                sysapp: sysapp
            }),
            contentType: "application/json; charset=utf-8",
            success: function () {
                getSysAllData(data);
                hideModal();
            },
            error: function () {
                toastr.error('Error on changing status!');
            }
        })
    }
}
//DATA CRUD end

//DATA HELPERS start
function viewCalendar() {
    showModal();
    ModalSize('xl');
    var title = 'LFC Calendar';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: '/Pages/_Support_Page/calendar',
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
function getOptDataForUpdate(dataSource, filter, id, name, selected) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'Common/getSelectedOptData',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            dataSource: dataSource,
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
                    dataSource: dataSource,
                    id: id,
                    name: name,
                    sysapp: sysapp
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    for (var i in data) {
                        RAWHTML += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
                    }
                    $('.' + id + '.triggerdetail').html(RAWHTML).select2();
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
function getOptDataForAdd() {
    var fields = $('.triggerdetail');
    var fieldID = [];
    for (var x in fields) {
        if (fields[x].className != undefined) {
            var y = fields[x].className.split(' ');
            fieldID.push(y[0]);
        }
    }
    for (var j in fieldID) {
        if ($('.' + fieldID[j] + '.triggerdetail')[0].tagName == 'SELECT') {
            var tagClasses = $('.' + fieldID[j] + '.triggerdetail')[0].className.split(' ');
            
            console.log(tagClasses);
            var optSource = tagClasses[2];
            var optId = tagClasses[0];
            var optName = tagClasses[1];
            var RAWHTML = '<option disabled selected>-</option>';
            getOptDataForAddAppend(optSource,optId,optName,RAWHTML);
        }
    }
}
function getOptDataForAddAppend(optSource,optId,optName,RAWHTML){
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
            $('.' + optSource + '.triggerdetail').html(RAWHTML).select2();
        },
        error: function () {
            toastr.error('Error on gathering Options!');
            stopLoading();
        }
    })
}
function showiFrame(data) {
    showModal();
    ModalSize('xl');
    var title = 'Show to Map ';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    $('.modal-footer').html(footer);
    $('.modal-title').html(title);
    //$('.modal-body').html('<iframe src="https://www.google.com/maps/place?igu=1/' + data + '"></iframe>');
    $('.modal-body').html('');
    $('#modalBody').css("height", "70vh");
    setTimeout(initMapGeoLoc, 250, data);
}

function initMapGeoLoc(data) {
    var geoloc = data.split(',');
    mapboxgl.accessToken = mbgl;
    var map = new mapboxgl.Map({
        container: 'modalBody',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [geoloc[0], geoloc[1]],
        zoom: 15
    });

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        })
    );
    const plantLocation = new mapboxgl.Marker().setLngLat([geoloc[0], geoloc[1]]).addTo(map);
}
function viewCalendar() {
    showModal();
    ModalSize('xl');
    var title = 'LFC Calendar';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button ><button onclick="print()" class="btn btn-success" data-dismiss="modal"> Print</button>';
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
    $.ajax({
        url: '/Pages/_Support_Page/calendar',
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
function getMonthNamebyNumber(dateNum) {
    if (dateNum == 1) {
        return 'Jan';
    } else if (dateNum == 2) {
        return 'Feb';
    } else if (dateNum == 3) {
        return 'Mar';
    } else if (dateNum == 4) {
        return 'Apr';
    } else if (dateNum == 5) {
        return 'May';
    } else if (dateNum == 6) {
        return 'Jun';
    } else if (dateNum == 7) {
        return 'Jul';
    } else if (dateNum == 8) {
        return 'Aug';
    } else if (dateNum == 9) {
        return 'Sep';
    } else if (dateNum == 10) {
        return 'Oct';
    } else if (dateNum == 11) {
        return 'Nov';
    } else if (dateNum == 12) {
        return 'Dec';
    } else {
        return 'Invalid Number';
    }
}
//DATA HELPERS end

//DATA TABLE start
function initDataTables(Data) {
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
    console.log(Data);
    console.log(Permission.includes(Data + "_add") || excempted.includes($("#username").val()));
    if (Permission.includes(Data + "_add") || excempted.includes($("#username").val())) {
        $('#tbl_' + Data + '_filter').append(' <button class="btn btn-outline-success btn-sm addData" onclick="addData(\'' + Data + '\')"><i class="fas fa-plus"></i> Add</button>');
    }
}

function getSysAllData(dataSource) {
    showdatatablesLoader(dataSource);
    var headcol = $('#tbl_' + dataSource + ' thead tr th');
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
            dataSource: dataSource,
            isactive: $('.statusFilter').is(':checked'),
            sysapp: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var datarow = [];
            $('#tbl_' + dataSource).DataTable().clear().draw();
            for (var i in data) {
                var dataarr = [];
                for (var j in colid) {
                    if (colid[j] == 'id') {
                        dataarr.push('<div style="text-align:center"><button type="button" onclick="updateData(\'' + dataSource + '\',\'' + data[i][colid[j]] + '\',\'' + data[i].name + '\',\'' + data[i].isactive + '\')" class="btn btn-outline-info btn-xs" style="width: 60px;">Update</button></div>');
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
            $('#tbl_' + dataSource).DataTable().rows.add(datarow).draw();
            hidedatatablesLoader(dataSource);
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            hidedatatablesLoader(dataSource);
        }
    })
}
function showdatatablesLoader(addTo) {
    $('#tbl_' + addTo).DataTable().clear().draw();
    var add = 'tbl_' + addTo + '_wrapper';
    var spinnerHTML = '<div class="d-flex justify-content-center dtloader ' + addTo + '" style="position: absolute;width: 100%;height: 100%;">' +
        '<span class="fa-stack fa-lg">' +
            '<i class="fa fa-spinner fa-spin fa-stack-2x fa-fw"></i>' +
        '</span>&nbsp;&nbsp;&nbsp;&nbsp;Processing ...' +
        '</div>';
    $('#' + add).prepend(spinnerHTML);
}
function hidedatatablesLoader(addTo) {
    $('.dtloader.' + addTo).remove();
}
//DATA TABLE end
$('.loginbox').on('keypress', function (e) {
    if (e.which == 13) {
        loginToPage();
    }
})
$(document).on("keydown", disableF5);
$(document).on('click', '.pagelink', function () {
    var that = this;
    startLoading();
    $.ajax({
        url: 'Pages/_Support_Page/checkSession',
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.HTML_container').append(htmlreturn);
            $('.pagelink').removeClass('active');
            $(that).addClass('active');
            var url = $(that).data('link');
            var pageTitle = $(that).data('pagename');
            $('#reloadpage').data('routepage', $(that).data('bcrumbs'));
            var breadcrumb = $(that).data('bcrumbs').split('/');
            var breadcrumbs = '';
            for (var i = 0; i < breadcrumb.length; i++) {
                if (breadcrumb.length - 1 == i) {
                    breadcrumbs += '<li class="breadcrumb-item active">' + breadcrumb[i] + '</li>'
                } else {
                    //breadcrumbs += '<li class="breadcrumb-item"><a href="javascript:;" class="breadcrumblink" data-route_name="' + breadcrumb[i] + '">' + breadcrumb[i] + '</a></li>'
                    breadcrumbs += '<li class="breadcrumb-item"><a href="javascript:;" class="" data-route_name="' + breadcrumb[i] + '">' + breadcrumb[i] + '</a></li>'
                }
            }
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'html',
                success: function (htmlreturn) {
                    var title = pageTitle;
                    $('.pageTitle').html(title);
                    $('.HTML_container').html(htmlreturn);
                    $('.breadcrumb').html(breadcrumbs);
                    stopLoading();
                },
                error: function () {
                    toastr.error('Error on route link!');
                    stopLoading();
                }
            })
        },
        error: function () {
            toastr.error('Error on route link!');
            stopLoading();
        }
    })
    
})
$(document).on('click', '.breadcrumblink', function () {
    routePagebyBC($(this).data('route_name'));
})
$(document).on('click', '#duplicatepage', function () {
    window.open(window.location.origin, '_blank');
})
$(document).on('click', '#helpbtn', function () {
    window.open('http://support.lapanday.com', '_blank');
})
function showModal() {
    $('#modalBody').removeAttr('style');
    $('#modal-default').modal('show');
    $('.modal-body').html('Loading...');
    $('.modal-footer').html('');
}
function hideModal() {
    $('#modal-default').modal('hide');
}
function ModalSize(size) {
    /*
        xs 
        s 
        m 
        l 
        xl
    */
    $('#modal-dialog').removeClass();
    if (size == 'xs') {
        $('#modal-dialog').addClass('modal-dialog modal-xs');
    } else if (size == 'sm') {
        $('#modal-dialog').addClass('modal-dialog modal-sm');
    } else if (size == 'md') {
        $('#modal-dialog').addClass('modal-dialog modal-md');
    } else if (size == 'lg') {
        $('#modal-dialog').addClass('modal-dialog modal-lg');
    } else if (size == 'xl') {
        $('#modal-dialog').addClass('modal-dialog modal-xl');
    } else {
        $('#modal-dialog').addClass('modal-dialog');
    }
}

$('.HTML_container').ready(function () {
    initDataTables('SysUsers');
    getAllUsersByApp(sysapp);
})
function getAllUsersByApp(appID) {
    startLoading();
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'UserFunctions/getAllUsersByApp',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            appID: appID
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var activeUser = 0;
            var inactiveUser = 0;
            var domainUser = 0;
            var RAWHTML = '';
            $('#tbl_SysUsers').DataTable().clear().draw();
            for (var i in data) {
                RAWHTML += '<tr>' +
                    '<td style="text-align:center"><button type="button" onclick="updateUser(\'' + data[i].username + '\', \'' + data[i].isdomain + '\')" class="btn btn-outline-info btn-xs" style="width: 75px;">Update</button> ';
                if (data[i].isactive) {
                    if (data[i].username != 'administrator') {
                        RAWHTML += '<button type="button" onclick="enabledisableuser(\'' + data[i].username + '\')" class="btn btn-outline-danger btn-xs" style="width: 75px;">Disable</button>';
                    }
                } else {
                    RAWHTML += '<button type="button" onclick="enabledisableuser(\'' + data[i].username + '\')" class="btn btn-outline-success btn-xs" style="width: 75px;">Enable</button>';
                }
                RAWHTML += '</td > ' +
                    '<td style="text-align:center">' + data[i].empid + '</td>' +
                    '<td>' + data[i].username + '</td>';
                if (data[i].lastlogindate != null) {
                    RAWHTML += '<td>' + moment(data[i].lastlogindate).format('MMMM DD YYYY, h:mm:ss a') + '</td>'
                } else {
                    RAWHTML += '<td> - </td>'
                }
                //'<td>' + data[i].username + '</td>' +
                //'<td>' + data[i].fullname + '</td>';
                if (data[i].isdomain == 'Yes') {
                    RAWHTML += '<td style="text-align:center;color:green"><b>' + data[i].isdomain + '</b></td>'
                } else {
                    RAWHTML += '<td style="text-align:center;color:royalblue"><b>' + data[i].isdomain + '</b></td>'
                }
                if (data[i].isactive) {
                    RAWHTML += '<td style="text-align:center;color:green"><b>Enabled</b></td>'
                    if (data[i].isdomain == "Yes") {
                        domainUser++;
                    }
                    activeUser++;
                } else {
                    inactiveUser++;
                    RAWHTML += '<td style="text-align:center;color:red"><b>Disabled</b></td>'
                }
                RAWHTML += '</tr>'
                $("#tbl_SysUsers").DataTable().row.add($(RAWHTML).get(i)).draw();
            }
            $('.activeUser').html(activeUser);
            $('.inactiveUser').html(inactiveUser);
            $('.domainUser').html(domainUser);
            stopLoading();
        },
        error: function () {
            toastr.error('Error on Fetching Data!');
            stopLoading();
        }
    })
}
function updateUser(username,isdomain) {
    showModal();
    ModalSize('xl');
    $.ajax({
        url: 'pages/_admin/modalpages/user_update',
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
    var title = 'Update user <b class="selectedusername">' + username + '</b>';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    if (isdomain == 'No') {
        footer += '<button type="button" class="btn btn-primary" onclick="resetNonDomainUser(\'' + username + '\')" >Reset Password</button>';
    }
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
}

function addUser(username, isdomain) {
    showModal();
    ModalSize('xl');
    $.ajax({
        url: 'pages/_admin/modalpages/user_add',
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
    var title = 'Add new system user';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    if (isdomain == 'No') {
        footer += '<button type="button" class="btn btn-success" onclick="saveUser()" >Save User</button>';
    }
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
}
//function viewUser(username) {
//    showModal();
//    ModalSize('xl');
//    $.ajax({
//        url: 'pages/_admin/modalpages/user_view',
//        type: 'post',
//        dataType: 'html',
//        success: function (htmlreturn) {
//            $('.modal-body').html(htmlreturn);
//        },
//        error: function () {
//            toastr.error('Error on fetching modal view!');
//        }
//    })
//    var title = 'View user <b class="selectedusername">' + username + '</b>';
//    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
//    $('.modal-title').html(title);
//    $('.modal-footer').html(footer);
//}
function enabledisableuser(usernametochangestatus) {
    $.ajax({
        url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'UserFunctions/enabledisableuser',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({
            username: $("#username").val(),
            token: $("#token").val(),
            usernametochangestatus: usernametochangestatus,
            appid: sysapp
        }),
        contentType: "application/json; charset=utf-8",
        success: function () {
            getAllUsersByApp(sysapp);
        },
        error: function () {
            toastr.error('API Auth Error!');
            stopLoading();
        }
    })
}
function resetNonDomainUser(username) {
    let text = 'Are you sure you want to reset the password of ' + username +'?';
    if (confirm(text) == true) {
        $.ajax({
            url: apiURL('c2673537-85cf-4a28-9cbc-5dad26d9c4a9') + 'UserFunctions/resetNonDomainUserPassword',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify({
                username: $("#username").val(),
                token: $("#token").val(),
                selecteduser: username,
                appid: sysapp
            }),
            contentType: "application/json; charset=utf-8",
            success: function () {
                alert('Password of ' + username +' is now \' Welcome@123 \'');
            },
            error: function () {
                toastr.error('API Auth Error!');
                stopLoading();
            }
        })
    }
}
function addDataSysUsers() {
    showModal();
    ModalSize('xl');
    $.ajax({
        url: 'pages/_admin/modalpages/user_add',
        type: 'post',
        dataType: 'html',
        success: function (htmlreturn) {
            $('.modal-body').html(htmlreturn);
        },
        error: function () {
            toastr.error('Error on fetching modal view!');
        }
    })
    var title = 'Update user <b class="selectedusername">' + username + '</b>';
    var footer = '<button type = "button" class="btn btn-default" data-dismiss="modal" > Close</button >';
    if (isdomain == 'No') {
        footer += '<button type="button" class="btn btn-primary" onclick="resetNonDomainUser(\'' + username + '\')" >Reset Password</button>';
    }
    $('.modal-title').html(title);
    $('.modal-footer').html(footer);
}
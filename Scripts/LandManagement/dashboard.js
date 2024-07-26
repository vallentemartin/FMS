var section = '';
var datatag = $('.status-bar').data('tag');
var permission = Permission.includes(datatag);
section = permission === true ? $('.status-bar').show() : $('.status-bar').hide();

$(document).ready(function() {
    initDatepicker();

});

function initDatepicker(){
    $('.form-inline input[name="t"]').datepicker({
        format: 'yyyy-mm-dd',
        todayHighlight: true
    });
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    $('.form-inline input[name="t"]').datepicker("setDate", yesterday);
}
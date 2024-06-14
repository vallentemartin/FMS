$('.role').ready(function () {
    console.log(1,Permission);
    setTimeout(function() {
        loadHomeContent();
        console.log('load na');
    }, 1000);
    console.log(3,Permission);
    getLDMSDashboardData();
})

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
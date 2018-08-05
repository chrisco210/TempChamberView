var latestData = {};

var template = '<p><%= JSON.stringify(data) %></p>';

var sensorTypes = ['temperature', 'humidity',]

function updateSensorData() {
    var request = new XMLHttpRequest();

    request.open('POST', '/api/sensors', true);
    request.setRequestHeader('authorization', 'tempkey');
    request.send();

    request.onreadystatechange = function(e) {
        if(request.readyState == 4 && request.status == 200) {
            latestData = JSON.parse(request.responseText);

            

            var html = ejs.render(template, {data: latestData});
            var displays = [];

            //for(var i = 0; i < sensorTypes.length; i++)

            $('#data-display').html(html);

        } else {
            console.log(e);
        }
    };
}


$(document).ready(function() {
    updateSensorData();
});

var latestData = {};

var template = '<p><%= JSON.stringify(data) %></p>';
var TEMPLATE_TAB = '<li class="tab col s3"><a href="#<%=data.name%>"><%=data.name%></a></li>';
var TEMPLATE_CARD = '<div class="col s12" id="<%=data.name%>"><h3><%=data.name%></h3><p><%= data.value + \' \' + data.units%></p></div>';


var sensorTypes = ['temperature', 'humidity',];

function updateSensorData() {
    console.log('Updating sensor data');
    var request = new XMLHttpRequest();

    request.open('POST', '/api/sensors', true);
    request.setRequestHeader('authorization', 'tempkey');
    request.send();

    request.onreadystatechange = function(e) {
        if(request.readyState == 4 && request.status == 200) {
            latestData = JSON.parse(request.responseText);

            latestData.data.forEach(function(elem) {
                var tab = ejs.render(TEMPLATE_TAB, {data: elem});
                var card = ejs.render(TEMPLATE_CARD, {data: elem});
                $('#sensor-tabs').append(tab);
                $('#sensor-display').append(card);
                $('.tabs').tabs();
            });
            

        } else {
            console.log(e);
        }
    };
}


$(document).ready(function() {

    updateSensorData();
});
